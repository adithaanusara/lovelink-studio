const { test } = require("node:test");
const assert = require("node:assert/strict");
const { PassThrough } = require("node:stream");
const { Prisma } = require("@prisma/client");
const { loadTs } = require("./load-ts.cjs");
const valid = { title: "Memory", recipient: "A", sender: "B", occasion: "Birthday", message: "Hello", theme: "romantic", coverImage: "https://example.com/photo.jpg", gallery: [], eventDate: "" };
const req = (body) => new Request("https://lovelink.example/api/memories", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { "content-type": "application/json" } });
function route(name, prisma = {}, extra = {}) {
  return loadTs(`app/api/${name}/route.ts`, { "@/lib/prisma": { prisma }, "@/lib/mailer": { sendResetOtpEmail: async () => ({ success: false }) }, ...extra });
}
for (const name of ["memories", "auth/login", "auth/signup", "auth/forgot-password", "auth/verify-otp", "auth/reset-password"]) {
  test(`${name}: malformed JSON returns 400 without database access`, async () => {
    const response = await route(name).POST(req("{"));
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /JSON/);
  });
}
test("invalid memory payload returns 400 before accessing storage", async () => {
  assert.equal((await route("memories").POST(req({ ...valid, title: " " }))).status, 400);
});
test("concurrent slug collision retries the insert and returns a working origin URL", async () => {
  const before = process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  const slugs = [];
  try {
    const response = await route("memories", { memoryProject: { create: async ({ data }) => {
      slugs.push(data.slug);
      if (slugs.length === 1) throw new Prisma.PrismaClientKnownRequestError("unique", { code: "P2002", clientVersion: "6" });
      return { slug: data.slug };
    } } }).POST(req(valid));
    assert.equal(response.status, 201);
    assert.equal(slugs.length, 2);
    assert.notEqual(slugs[0], slugs[1]);
    assert.equal((await response.json()).shareUrl, `https://lovelink.example/${slugs[1]}`);
  } finally { if (before === undefined) delete process.env.NEXT_PUBLIC_APP_URL; else process.env.NEXT_PUBLIC_APP_URL = before; }
});
test("reserved or empty slugs cannot shadow application pages", async () => {
  for (const customSlugBase of ["login", "!!!"]) {
    let slug;
    const response = await route("memories", { memoryProject: { create: async ({ data }) => { slug = data.slug; return { slug }; } } }).POST(req({ ...valid, customSlugBase }));
    assert.equal(response.status, 201);
    assert.match(slug, /^memory-/);
  }
});
test("signup duplicate insert races return a conflict", async () => {
  const response = await route("auth/signup", { user: { findUnique: async () => null, create: async () => { throw new Prisma.PrismaClientKnownRequestError("unique", { code: "P2002", clientVersion: "6" }); } } }, { "@/lib/password": { hashPassword: async () => "hash" } }).POST(req({ name: "A", email: "a@example.com", password: "secret" }));
  assert.equal(response.status, 409);
});
test("login normalizes email but preserves password input", async () => {
  let email, password;
  const response = await route("auth/login", { user: { findUnique: async ({ where }) => { email = where.email; return { name: "A", email, passwordHash: "hash" }; } } }, { "@/lib/password": { verifyPassword: async (value) => { password = value; return true; } } }).POST(req({ email: " A@EXAMPLE.COM ", password: " secret " }));
  assert.equal(response.status, 200);
  assert.equal(email, "a@example.com");
  assert.equal(password, " secret ");
});
test("development email fallback keeps the generated OTP available for verification", async () => {
  let deleted = false;
  const response = await route("auth/forgot-password", { user: { findUnique: async () => ({ id: "u" }) }, passwordResetOtp: { updateMany: async () => ({}), create: async () => ({ id: "otp" }), delete: async () => { deleted = true; } } }).POST(req({ email: "a@example.com" }));
  assert.equal(response.status, 200);
  assert.match((await response.json()).otp, /^\d{6}$/);
  assert.equal(deleted, false);
});
test("simultaneous password resets can consume an OTP only once", async () => {
  let consumed = false, passwordUpdates = 0;
  const tx = { passwordResetOtp: { updateMany: async ({ where }) => {
    if (!where.id) return { count: 0 };
    if (consumed) return { count: 0 };
    consumed = true; return { count: 1 };
  } }, passwordResetToken: { updateMany: async () => ({ count: 0 }) }, user: { update: async () => { passwordUpdates++; } } };
  const prisma = { user: { findUnique: async () => ({ id: "u" }) }, passwordResetOtp: { findFirst: async () => ({ id: "otp", attempts: 0, codeHash: "matching", expiresAt: new Date(Date.now() + 60000) }) }, $transaction: async (fn) => fn(tx) };
  const handler = route("auth/reset-password", prisma, { "@/lib/otp": { hashOtpCode: () => "matching" }, "@/lib/password": { hashPassword: async () => "new-hash" } });
  const payload = { email: "a@example.com", otp: "123456", newPassword: "secret", confirmPassword: "secret" };
  const responses = await Promise.all([handler.POST(req(payload)), handler.POST(req(payload))]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 400]);
  assert.equal(passwordUpdates, 1);
});
function uploadHandler(upload_stream) {
  return route("upload", {}, { "@/lib/cloudinary": { uploader: { upload_stream }, url: () => "https://example.com/poster.jpg" } });
}
test("upload rejects malformed multipart bodies and text pretending to be a file", async () => {
  const handler = uploadHandler(() => { throw new Error("should not upload"); });
  assert.equal((await handler.POST(req({}))).status, 400);
  for (const value of ["pretend file", new File([], "empty.jpg", { type: "image/jpeg" })]) {
    const body = new FormData(); body.set("file", value);
    assert.equal((await handler.POST(new Request("http://localhost/api/upload", { method: "POST", body }))).status, 400);
  }
});
test("upload validates MIME and size before calling Cloudinary", async () => {
  const handler = uploadHandler(() => { throw new Error("should not upload"); });
  for (const file of [new File(["hi"], "a.txt", { type: "text/plain" }), new File([new Uint8Array(15 * 1024 * 1024 + 1)], "big.jpg", { type: "image/jpeg" })]) {
    const body = new FormData(); body.set("file", file);
    const response = await handler.POST(new Request("http://localhost/api/upload", { method: "POST", body }));
    assert.equal(response.status, 400);
  }
});
test("video uploads return a video resource and poster", async () => {
  const handler = uploadHandler((options, callback) => {
    assert.equal(options.resource_type, "auto");
    const stream = new PassThrough(); stream.on("data", () => {});
    stream.on("finish", () => callback(null, { public_id: "clip", secure_url: "https://example.com/clip.mp4" }));
    return stream;
  });
  const body = new FormData(); body.set("file", new File(["video"], "clip.mp4", { type: "video/mp4" }));
  const response = await handler.POST(new Request("http://localhost/api/upload", { method: "POST", body }));
  assert.deepEqual(await response.json(), { url: "https://example.com/clip.mp4", resourceType: "video", poster: "https://example.com/poster.jpg" });
});
