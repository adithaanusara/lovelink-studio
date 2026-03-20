const { test } = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { loadTs } = require("./load-ts.cjs");
test("memory cards link to the public slug route", () => {
  const { MemoryCard } = loadTs("components/MemoryCard.tsx");
  const html = renderToStaticMarkup(React.createElement(MemoryCard, { slug: "our-memory", title: "Hello", recipient: "A", sender: "B", occasion: "Birthday", coverImage: "https://example.com/photo.jpg", theme: "romantic" }));
  assert.match(html, /href="\/our-memory"/);
  assert.doesNotMatch(html, /href="\/p\//);
});
for (const layoutJson of [null, { storyScenes: "invalid legacy data" }]) {
  test(`legacy memories render their message and cover (${JSON.stringify(layoutJson)})`, async () => {
    const page = loadTs("app/[slug]/page.tsx", { "@/lib/prisma": { prisma: { memoryProject: { findUnique: async () => ({ title: "Our birthday", recipient: "Alex", sender: "Sam", occasion: "Birthday", message: "A special message", coverImage: "https://example.com/photo.jpg", layoutJson, gallery: [] }) } } }, "@/components/StorySceneViewer": { StorySceneViewer: () => null } });
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug: "memory" }) }));
    assert.match(html, /Our birthday/);
    assert.match(html, /A special message/);
    assert.match(html, /photo.jpg/);
    assert.doesNotMatch(html, /no scene data/);
  });
}
test("password input keeps toggle buttons out of form submissions", () => {
  const { PasswordInput } = loadTs("components/PasswordInput.tsx");
  const html = renderToStaticMarkup(React.createElement(PasswordInput, { name: "password", required: true }));
  assert.match(html, /type="button"/);
  assert.match(html, /type="password"/);
  assert.match(html, /aria-label="Show password"/);
});
