// The editor and the public page share one fixed design area. Every scene is laid out in
// these pixels, and each screen shows that same area scaled as a whole, so positions,
// sizes and text wrapping stay as designed at any resolution.
export const DESIGN_WIDTH = 1000;
export const STAGE_HEIGHT = 760;

// The album draws a header above its pages and page dots below them, past its own height.
const BOOK_OVERHANG = 110;

type StageItem = {
  type: "text" | "image";
  x: number;
  y: number;
  w: number;
  h: number;
  content?: string;
  src?: string | null;
};

type StageBook = {
  enabled: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
};

// Pages saved when the editor canvas could grow past the design width can hold content
// outside the design area, so the stage grows to keep all of it on screen.
export function getStageSize(items: StageItem[], book?: StageBook) {
  const visibleItems = items.filter((item) =>
    item.type === "text" ? Boolean(item.content) : Boolean(item.src),
  );

  return {
    width: Math.max(
      DESIGN_WIDTH,
      ...visibleItems.map((item) => item.x + item.w),
      book?.enabled ? book.x + book.w : 0,
    ),
    height: Math.max(
      STAGE_HEIGHT,
      ...visibleItems.map((item) => item.y + item.h),
      book?.enabled ? book.y + book.h + BOOK_OVERHANG : 0,
    ),
  };
}

// The largest centred fit of the stage inside the screen, shrinking or growing as needed.
export function fitStage(
  screen: { width: number; height: number },
  stage: { width: number; height: number },
) {
  const scale = Math.min(screen.width / stage.width, screen.height / stage.height);

  return {
    scale,
    left: (screen.width - stage.width * scale) / 2,
    top: (screen.height - stage.height * scale) / 2,
  };
}
