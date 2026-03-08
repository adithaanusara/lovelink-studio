const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./load-ts.cjs");
const { memorySchema, emailSchema, nameSchema } = loadTs("lib/validation.ts");
const valid = { title: "Memory", recipient: "A", sender: "B", occasion: "Birthday", message: "Hello", theme: "romantic", coverImage: "https://example.com/photo.jpg", gallery: [], eventDate: "" };

test("normalize emails and reject blank names", () => {
  assert.equal(emailSchema.parse("  HELLO@Example.com "), "hello@example.com");
  assert.equal(nameSchema.safeParse("   ").success, false);
});
test("calendar dates reject rollover and accept leap days", () => {
  for (const date of ["2026-02-29", "2026-04-31", "not-a-date", "2026-13-01"]) {
    assert.equal(memorySchema.safeParse({ ...valid, eventDate: date }).success, false, date);
  }
  assert.equal(memorySchema.safeParse({ ...valid, eventDate: "2024-02-29" }).success, true);
  assert.equal(memorySchema.safeParse(valid).success, true);
});
test("reject executable media URLs, invalid themes and malformed scenes", () => {
  for (const changes of [{ coverImage: "javascript:alert(1)" }, { musicUrl: "data:text/html,evil" }, { theme: "unknown" }, { layoutJson: { storyScenes: "bad" } }, { layoutJson: { storyScenes: [{ items: [] }] } }]) {
    assert.equal(memorySchema.safeParse({ ...valid, ...changes }).success, false);
  }
});
test("accept editor scenes including empty slots and preserve positioning", () => {
  const scene = { id: "scene-1", name: "Scene", background: "#fff", backgroundImage: "", items: [{ id: "photo", type: "image", x: 0, y: 1, w: 200, h: 100, src: "", imagePositionX: 42 }] };
  const data = memorySchema.parse({ ...valid, layoutJson: { storyScenes: [scene] } });
  assert.equal(data.layoutJson.storyScenes[0].items[0].imagePositionX, 42);
});
const { safeNextPath } = loadTs("lib/navigation.ts");
test("redirects only use local paths", () => {
  for (const value of [null, "https://evil.com", "//evil.com", "javascript:alert(1)", "/\\evil.com", "/%2f%2fevil.com", "/%0aevil", "/%zz"]) assert.equal(safeNextPath(value), "/create");
  assert.equal(safeNextPath("/create?mode=edit#details"), "/create?mode=edit#details");
});
const { formatDate } = loadTs("lib/utils.ts");
test("event dates do not shift with the reader's timezone", () => {
  const prior = process.env.TZ;
  try {
    process.env.TZ = "America/Los_Angeles";
    assert.equal(formatDate("2026-03-20"), "March 20, 2026");
    assert.equal(formatDate("bad"), "");
    assert.equal(formatDate(null), "");
  } finally { if (prior === undefined) delete process.env.TZ; else process.env.TZ = prior; }
});
test("malformed password hashes fail safely and valid passwords retain spaces", async () => {
  const { hashPassword, verifyPassword } = loadTs("lib/password.ts");
  for (const hash of ["", "salt:zz", "a:b:extra"]) assert.equal(await verifyPassword("secret", hash), false);
  const hash = await hashPassword(" secret ");
  assert.equal(await verifyPassword(" secret ", hash), true);
  assert.equal(await verifyPassword("secret", hash), false);
});
