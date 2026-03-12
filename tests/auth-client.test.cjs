const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./load-ts.cjs");
function setup(fetch, oauth = {}) {
  const storage = new Map();
  const window = { localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) }, dispatchEvent() {} };
  const client = loadTs("lib/auth-client.ts", { "next-auth/react": { getSession: async () => null, signOut: async () => {}, ...oauth } }, { window, fetch });
  return { client, storage, window };
}
test("network errors return recoverable form errors", async () => {
  const { client } = setup(async () => { throw new Error("offline"); });
  const result = await client.loginAccount("a@example.com", "secret");
  assert.equal(result.success, false);
  assert.match(result.message, /connection/);
});
test("HTTP success without a valid payload never signs in", async () => {
  const { client, storage } = setup(async () => new Response("<html>oops</html>"));
  assert.equal((await client.loginAccount("a@example.com", "secret")).success, false);
  assert.equal(storage.size, 0);
});
test("password whitespace is preserved through login and reset", async () => {
  const payloads = [];
  const { client } = setup(async (_, init) => { payloads.push(JSON.parse(init.body)); return Response.json({ success: true }); });
  assert.equal((await client.loginAccount(" A@example.com ", " secret ")).success, true);
  assert.equal(payloads[0].password, " secret ");
  assert.equal(payloads[0].email, "a@example.com");
  assert.equal((await client.resetForgotPassword("a@example.com", "123456", " secret ", " secret ")).success, true);
  assert.equal(payloads[1].newPassword, " secret ");
});
test("OAuth identity is recognized and logout terminates that session", async () => {
  let signedOut = false;
  const { client } = setup(global.fetch, { getSession: async () => ({ user: { email: "google@example.com" } }), signOut: async () => { signedOut = true; } });
  assert.equal(await client.getAccountEmail(), "google@example.com");
  await client.logout();
  assert.equal(signedOut, true);
});
test("disabled storage produces a useful sign-in error", async () => {
  const { client, window } = setup(async () => Response.json({ success: true }));
  window.localStorage.setItem = () => { throw new Error("blocked"); };
  const result = await client.loginAccount("a@example.com", "secret");
  assert.equal(result.success, false);
  assert.match(result.message, /browser storage/);
});
