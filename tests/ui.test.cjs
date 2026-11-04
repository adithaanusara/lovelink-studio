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
test("the stage fits the whole design on any screen, centred and in proportion", () => {
  const { fitStage, DESIGN_WIDTH, STAGE_HEIGHT } = loadTs("lib/stage.ts");
  const stage = { width: DESIGN_WIDTH, height: STAGE_HEIGHT };
  for (const screen of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1920, height: 1080 }, { width: 3840, height: 2160 }]) {
    const { scale, left, top } = fitStage(screen, stage);
    assert.ok(left > -0.001 && top > -0.001);
    assert.ok(Math.abs(left * 2 + stage.width * scale - screen.width) < 0.001);
    assert.ok(Math.abs(top * 2 + stage.height * scale - screen.height) < 0.001);
    assert.ok(Math.abs(left) < 0.001 || Math.abs(top) < 0.001);
  }
  assert.equal(fitStage({ width: 2000, height: 1520 }, stage).scale, 2);
});
test("the stage only grows for content saved outside the design area", () => {
  const { getStageSize, DESIGN_WIDTH, STAGE_HEIGHT } = loadTs("lib/stage.ts");
  const text = { type: "text", content: "Hi", x: 70, y: 70, w: 400, h: 280 };
  const wide = { type: "image", src: "https://example.com/a.jpg", x: 1100, y: 800, w: 300, h: 100 };
  const emptySlot = { ...wide, src: "" };
  assert.deepEqual(getStageSize([text, emptySlot]), { width: DESIGN_WIDTH, height: STAGE_HEIGHT });
  assert.deepEqual(getStageSize([text, wide]), { width: 1400, height: 900 });
  assert.deepEqual(getStageSize([], { enabled: true, x: 170, y: 180, w: 760, h: 460 }), { width: DESIGN_WIDTH, height: STAGE_HEIGHT });
  assert.equal(getStageSize([], { enabled: true, x: 170, y: 300, w: 760, h: 460 }).height, 870);
});
