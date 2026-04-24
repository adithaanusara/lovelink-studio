"use client";

import { useEffect, useMemo, useState } from "react";

export type BookSlotMedia = {
  type: "image" | "video";
  url: string;
  poster?: string;
};

export type BookPageMedia = {
  layoutId?: number;
  slots: Array<BookSlotMedia | null>;
};

type MemoryBookProps = {
  pageCount: number;
  pages: BookPageMedia[];
  editable?: boolean;
  currentPage?: number;
  onCurrentPageChange?: (page: number) => void;
  onUploadPage?: (encodedSlotIndex: number) => void;
  width?: number;
  height?: number;
  coverImage?: string;
  coverPositionX?: number;
  coverPositionY?: number;
  title?: string;
};

type TurnState = "idle" | "opening" | "next" | "prev";

type AlbumTile = {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
};

/**
 * Layouts:
 * 0 = 1 photo
 * 1 = 2 photos
 * 2 = 3 photos
 * 3 = 4 photos
 */
const PAGE_LAYOUTS: AlbumTile[][] = [
  [{ x: 2.6, y: 4, w: 94.8, h: 88.2, rotate: 0 }],
  [
    { x: 2.8, y: 4.2, w: 46.2, h: 87.5, rotate: -0.9 },
    { x: 51, y: 4.2, w: 46.2, h: 87.5, rotate: 0.9 },
  ],
  [
    { x: 2.8, y: 4.2, w: 57.2, h: 87.4, rotate: -0.7 },
    { x: 62.2, y: 4.2, w: 34.8, h: 41.8, rotate: 0.8 },
    { x: 62.2, y: 49.8, w: 34.8, h: 41.8, rotate: -0.7 },
  ],
  [
    { x: 2.8, y: 4.2, w: 46.2, h: 41.8, rotate: -0.5 },
    { x: 51, y: 4.2, w: 46.2, h: 41.8, rotate: 0.5 },
    { x: 2.8, y: 49.8, w: 46.2, h: 41.8, rotate: 0.4 },
    { x: 51, y: 49.8, w: 46.2, h: 41.8, rotate: -0.4 },
  ],
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeSpread(page: number, pageCount: number) {
  if (page < 0) return -1;
  const safe = Math.max(0, Math.min(page, pageCount - 1));
  return safe % 2 === 0 ? safe : safe - 1;
}

function getLayoutIdFromSlotCount(slotCount: number) {
  const safeCount = clamp(slotCount || 1, 1, 4);
  return safeCount - 1;
}

function resolveLayoutId(page: BookPageMedia | undefined, pageIndex: number) {
  if (typeof page?.layoutId === "number" && page.layoutId >= 0 && page.layoutId <= 3) {
    return page.layoutId;
  }

  const slotCount = Array.isArray(page?.slots) ? page!.slots.length : 0;

  if (slotCount > 0) {
    return getLayoutIdFromSlotCount(slotCount);
  }

  return pageIndex % PAGE_LAYOUTS.length;
}

function buildSlotsForLayout(
  page: BookPageMedia | undefined,
  layoutLength: number
): Array<BookSlotMedia | null> {
  const current = Array.isArray(page?.slots) ? [...page!.slots] : [];
  const trimmed = current.slice(0, layoutLength);

  while (trimmed.length < layoutLength) {
    trimmed.push(null);
  }

  return trimmed;
}

function renderMedia(media: BookSlotMedia | null | undefined, alt: string) {
  if (!media?.url) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[0.45rem] bg-[#f3f3ef] text-center text-[11px] font-semibold tracking-[0.18em] text-slate-500">
        DOUBLE CLICK
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <video
        src={media.url}
        poster={media.poster}
        className="h-full w-full rounded-[0.45rem] object-cover"
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={media.url}
      alt={alt}
      className="h-full w-full rounded-[0.45rem] object-cover"
      draggable={false}
    />
  );
}

function getCoverPreview(pages: BookPageMedia[]) {
  return pages
    .flatMap((page) => (Array.isArray(page.slots) ? page.slots : []))
    .filter((slot): slot is BookSlotMedia => Boolean(slot?.url))
    .slice(0, 3);
}

function AlbumPage({
  pageIndex,
  page,
  editable,
  onUploadPage,
  side,
}: {
  pageIndex: number;
  page: BookPageMedia | undefined;
  editable: boolean;
  onUploadPage?: (encodedSlotIndex: number) => void;
  side: "left" | "right";
}) {
  const resolvedLayoutId = resolveLayoutId(page, pageIndex);
  const layout = PAGE_LAYOUTS[resolvedLayoutId];
  const slots = buildSlotsForLayout(page, layout.length);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbfbf8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.03),transparent_30%)]" />

      <div
        className="absolute inset-y-0 w-[10px]"
        style={{
          [side === "left" ? "right" : "left"]: 0,
          background:
            side === "left"
              ? "linear-gradient(to left, rgba(0,0,0,0.05), transparent)"
              : "linear-gradient(to right, rgba(0,0,0,0.05), transparent)",
        }}
      />

      <div className="absolute inset-[2.1%] rounded-[1.8rem] border border-[#ecece6] bg-[#fdfdfa]" />

      {layout.map((tile, slotIndex) => {
        const media = slots[slotIndex] ?? null;
        const encodedSlotIndex = pageIndex * 10 + slotIndex;

        return (
          <button
            key={`${pageIndex}-${slotIndex}`}
            type="button"
            className="absolute overflow-hidden rounded-[0.8rem] bg-white p-[6px] shadow-[0_14px_28px_rgba(0,0,0,0.10)]"
            style={{
              left: `${tile.x}%`,
              top: `${tile.y}%`,
              width: `${tile.w}%`,
              height: `${tile.h}%`,
              transform: `rotate(${tile.rotate}deg)`,
              cursor: editable ? "pointer" : "default",
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (editable && onUploadPage) {
                onUploadPage(encodedSlotIndex);
              }
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[0.5rem] bg-[#f3f3ef]">
              {renderMedia(
                media,
                `Album page ${pageIndex + 1} photo ${slotIndex + 1}`
              )}
            </div>
          </button>
        );
      })}

      <div
        className={`absolute bottom-4 ${
          side === "left" ? "left-5" : "right-5"
        } rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-500 shadow-sm`}
      >
        {pageIndex + 1}
      </div>
    </div>
  );
}

export function MemoryBook({
  pageCount,
  pages,
  editable = false,
  currentPage,
  onCurrentPageChange,
  onUploadPage,
  width = 760,
  height = 460,
  coverImage,
  coverPositionX = 50,
  coverPositionY = 50,
  title = "Our Album",
}: MemoryBookProps) {
  const [internalPage, setInternalPage] = useState(-1);
  const [turnState, setTurnState] = useState<TurnState>("idle");

  // add this new one - receiver side next/prev freeze wena issue fix
  const controlled =
    typeof currentPage === "number" && typeof onCurrentPageChange === "function";

  const activePage = normalizeSpread(
    controlled ? currentPage : internalPage,
    pageCount
  );

  const setPage = (page: number) => {
    const normalized = normalizeSpread(page, pageCount);

    if (controlled && onCurrentPageChange) {
      onCurrentPageChange(normalized);
      return;
    }

    setInternalPage(normalized);
  };

  const leftIndex = activePage;
  const rightIndex = Math.min(activePage + 1, pageCount - 1);

  const spreadDots = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < pageCount; i += 2) arr.push(i);
    return arr;
  }, [pageCount]);

  const coverPreview = useMemo(() => getCoverPreview(pages), [pages]);

  useEffect(() => {
    if (turnState === "idle") return;
    const timer = setTimeout(() => setTurnState("idle"), 720);
    return () => clearTimeout(timer);
  }, [turnState]);

  const openAlbum = () => {
    if (turnState !== "idle") return;
    setTurnState("opening");
    setTimeout(() => setPage(0), 280);
  };

  const flipNext = () => {
    if (turnState !== "idle") return;

    if (activePage < 0) {
      openAlbum();
      return;
    }

    setTurnState("next");
    const next = activePage + 2 >= pageCount ? -1 : activePage + 2;
    setTimeout(() => setPage(next), 320);
  };

  const flipPrev = () => {
    if (turnState !== "idle") return;

    if (activePage < 0) {
      const last = Math.max(
        0,
        pageCount % 2 === 0 ? pageCount - 2 : pageCount - 1
      );
      setTurnState("prev");
      setTimeout(() => setPage(last), 320);
      return;
    }

    setTurnState("prev");
    const prev = activePage - 2 < 0 ? -1 : activePage - 2;
    setTimeout(() => setPage(prev), 320);
  };

  const singlePageWidth = width / 2;

  return (
    <div className="relative h-full w-full select-none">
      <style>{`
        @keyframes album-open {
          0% {
            transform: perspective(1800px) rotateY(0deg) translateX(0);
            opacity: 1;
          }
          100% {
            transform: perspective(1800px) rotateY(-110deg) translateX(-10px);
            opacity: 0;
          }
        }

        @keyframes album-page-next {
          0% {
            transform: perspective(1800px) rotateY(0deg);
            opacity: 0.98;
          }
          100% {
            transform: perspective(1800px) rotateY(-115deg);
            opacity: 0;
          }
        }

        @keyframes album-page-prev {
          0% {
            transform: perspective(1800px) rotateY(0deg);
            opacity: 0.98;
          }
          100% {
            transform: perspective(1800px) rotateY(115deg);
            opacity: 0;
          }
        }

        @keyframes subtle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>

      <div className="mb-3 flex items-center justify-between rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs text-slate-600 shadow-sm">
        <span className="tracking-[0.28em] uppercase">Album</span>
        <span>
          {activePage < 0
            ? "Cover"
            : `Page ${leftIndex + 1}${
                leftIndex + 1 < pageCount ? ` - ${rightIndex + 1}` : ""
              } / ${pageCount}`}
        </span>
      </div>

      <div className="relative" style={{ width, height: height + 12 }}>
        {activePage < 0 ? (
          <div
            className="relative mx-auto"
            style={{
              width: singlePageWidth,
              height,
            }}
          >
            <div className="absolute left-4 top-4 h-full w-full rounded-[2.2rem] bg-black/10 blur-lg" />
            <div
              className="relative h-full w-full cursor-pointer overflow-hidden rounded-[2.2rem] border border-[#ededed] bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f4_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
              onClick={openAlbum}
            >
              {coverImage ? (
                <>
                  <img
                    src={coverImage}
                    alt="Album cover"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      objectPosition: `${coverPositionX}% ${coverPositionY}%`,
                    }}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-white/70" />
                </>
              ) : null}

              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#e8e8e3] via-[#f7f7f4] to-transparent" />
              <div className="absolute inset-y-8 left-5 w-[2px] rounded-full bg-slate-200" />
              <div className="absolute inset-y-8 left-8 w-[1px] rounded-full bg-slate-100" />

              <div className="relative z-10 flex h-full flex-col justify-between px-10 py-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
                    photo album
                  </p>
                  <h3 className="mt-5 text-3xl font-black leading-tight text-slate-800 md:text-4xl">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-[280px] text-sm leading-7 text-slate-500">
                    Open this album and view your memories in a clean collage
                    style.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {coverPreview.length > 0 ? (
                    coverPreview.map((item, index) => (
                      <div
                        key={`${item.url}-${index}`}
                        className="rounded-[1rem] bg-white p-2 shadow-[0_12px_24px_rgba(0,0,0,0.1)]"
                        style={{
                          animation: "subtle-float 3.2s ease-in-out infinite",
                          animationDelay: `${index * 0.2}s`,
                        }}
                      >
                        <div className="h-20 overflow-hidden rounded-[0.8rem] bg-[#f3f3ef]">
                          {renderMedia(item, `Album preview ${index + 1}`)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="rounded-[1rem] bg-white p-2 shadow-[0_12px_24px_rgba(0,0,0,0.1)]">
                        <div className="flex h-20 items-center justify-center rounded-[0.8rem] bg-[#f3f3ef] text-xs font-medium text-slate-400">
                          Photo
                        </div>
                      </div>
                      <div className="rounded-[1rem] bg-white p-2 shadow-[0_12px_24px_rgba(0,0,0,0.1)]">
                        <div className="flex h-20 items-center justify-center rounded-[0.8rem] bg-[#f3f3ef] text-xs font-medium text-slate-400">
                          Photo
                        </div>
                      </div>
                      <div className="rounded-[1rem] bg-white p-2 shadow-[0_12px_24px_rgba(0,0,0,0.1)]">
                        <div className="flex h-20 items-center justify-center rounded-[0.8rem] bg-[#f3f3ef] text-xs font-medium text-slate-400">
                          Photo
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                    Click to open
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                    {pageCount} pages
                  </div>
                </div>
              </div>

              {turnState === "opening" ? (
                <div
                  className="absolute inset-0 z-30 origin-left rounded-[2.2rem] border border-[#ededed] bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f2_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
                  style={{
                    animation:
                      "album-open 720ms cubic-bezier(0.22,1,0.36,1) forwards",
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f2_100%)]" />
            <div className="absolute inset-y-0 left-1/2 z-20 w-[24px] -translate-x-1/2 bg-gradient-to-r from-black/[0.06] via-white to-black/[0.06]" />

            <div className="relative flex h-full w-full">
              <div className="relative flex-1 overflow-hidden">
                <AlbumPage
                  pageIndex={leftIndex}
                  page={pages[leftIndex]}
                  editable={editable}
                  onUploadPage={onUploadPage}
                  side="left"
                />
              </div>

              <div className="relative flex-1 overflow-hidden">
                {leftIndex + 1 < pageCount ? (
                  <AlbumPage
                    pageIndex={rightIndex}
                    page={pages[rightIndex]}
                    editable={editable}
                    onUploadPage={onUploadPage}
                    side="right"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#fbfbf8] text-center text-sm text-slate-400">
                    End of album
                  </div>
                )}
              </div>

              {turnState === "next" ? (
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-1/2 origin-left rounded-r-[1.9rem] bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f2_100%)] shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
                  style={{
                    animation:
                      "album-page-next 720ms cubic-bezier(0.22,1,0.36,1) forwards",
                  }}
                />
              ) : null}

              {turnState === "prev" ? (
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/2 origin-right rounded-l-[1.9rem] bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f2_100%)] shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
                  style={{
                    animation:
                      "album-page-prev 720ms cubic-bezier(0.22,1,0.36,1) forwards",
                  }}
                />
              ) : null}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={flipPrev}
          className="absolute left-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-slate-200 bg-white/92 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-md transition hover:bg-white"
        >
          Prev
        </button>

        <button
          type="button"
          onClick={flipNext}
          className="absolute right-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-slate-200 bg-white/92 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-md transition hover:bg-white"
        >
          Next
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setPage(-1)}
          className={`h-2.5 w-2.5 rounded-full transition ${
            activePage < 0 ? "bg-slate-700" : "bg-slate-300"
          }`}
          aria-label="Go to cover"
        />

        {spreadDots.map((spreadStart) => (
          <button
            key={spreadStart}
            type="button"
            onClick={() => setPage(spreadStart)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              activePage === spreadStart ? "bg-slate-700" : "bg-slate-300"
            }`}
            aria-label={`Go to spread ${spreadStart + 1}`}
          />
        ))}
      </div>
    </div>
  );
}