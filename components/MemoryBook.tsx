"use client";

import { useEffect, useMemo, useState } from "react";

export type BookSlotMedia = {
  type: "image" | "video";
  url: string;
  poster?: string;
};

export type BookPageMedia = {
  layoutId: number;
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

const PAGE_LAYOUTS: AlbumTile[][] = [
  [{ x: 10, y: 12, w: 68, h: 54, rotate: -1.2 }],
  [
    { x: 8, y: 12, w: 33, h: 54, rotate: -1.6 },
    { x: 45, y: 12, w: 33, h: 54, rotate: 1.4 },
  ],
  [
    { x: 8, y: 10, w: 31, h: 56, rotate: -1.8 },
    { x: 43, y: 10, w: 35, h: 26, rotate: 1.1 },
    { x: 43, y: 40, w: 35, h: 26, rotate: -1.2 },
  ],
  [
    { x: 8, y: 10, w: 34, h: 26, rotate: -1.5 },
    { x: 46, y: 10, w: 32, h: 26, rotate: 1.2 },
    { x: 8, y: 40, w: 32, h: 26, rotate: -1.1 },
    { x: 44, y: 40, w: 34, h: 26, rotate: 1.3 },
  ],
  [
    { x: 8, y: 10, w: 28, h: 26, rotate: -2.4 },
    { x: 40, y: 10, w: 38, h: 56, rotate: 1.2 },
    { x: 8, y: 40, w: 28, h: 26, rotate: -1.1 },
  ],
  [
    { x: 8, y: 10, w: 70, h: 28, rotate: -1.2 },
    { x: 8, y: 42, w: 22, h: 24, rotate: -1.4 },
    { x: 33, y: 42, w: 22, h: 24, rotate: 1.1 },
    { x: 58, y: 42, w: 20, h: 24, rotate: -1.1 },
  ],
];

function normalizeSpread(page: number, pageCount: number) {
  if (page < 0) return -1;
  const safe = Math.max(0, Math.min(page, pageCount - 1));
  return safe % 2 === 0 ? safe : safe - 1;
}

function renderMedia(media: BookSlotMedia | null | undefined, alt: string) {
  if (!media?.url) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[0.7rem] bg-[#f5f5f1] text-center text-xs font-medium text-slate-400">
        Add photo
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <video
        src={media.url}
        poster={media.poster}
        className="h-full w-full rounded-[0.7rem] object-cover"
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
      className="h-full w-full rounded-[0.7rem] object-cover"
      draggable={false}
    />
  );
}

function getCoverPreview(pages: BookPageMedia[]) {
  return pages
    .flatMap((page) => page.slots)
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
  const safeLayoutId = page?.layoutId ?? 0;
  const layout = PAGE_LAYOUTS[safeLayoutId % PAGE_LAYOUTS.length];
  const slots = page?.slots ?? Array.from({ length: layout.length }, () => null);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbfbf8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.03),transparent_30%)]" />

      <div
        className={`absolute inset-y-0 ${
          side === "left" ? "right-0" : "left-0"
        } w-[10px] bg-gradient-to-${side === "left" ? "l" : "r"} from-black/5 to-transparent`}
      />

      <div className="absolute inset-[4.5%] rounded-[1.3rem] border border-[#ecece6] bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]" />

      {layout.map((tile, slotIndex) => {
        const media = slots[slotIndex] ?? null;
        const encodedSlotIndex = pageIndex * 10 + slotIndex;

        return (
          <div
            key={`${pageIndex}-${slotIndex}`}
            className="absolute rounded-[0.9rem] bg-white p-[8px] shadow-[0_18px_35px_rgba(0,0,0,0.12)]"
            style={{
              left: `${tile.x}%`,
              top: `${tile.y}%`,
              width: `${tile.w}%`,
              height: `${tile.h}%`,
              transform: `rotate(${tile.rotate}deg)`,
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (editable && onUploadPage) {
                onUploadPage(encodedSlotIndex);
              }
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[0.75rem] bg-[#f6f6f2]">
              {renderMedia(
                media,
                `Album page ${pageIndex + 1} photo ${slotIndex + 1}`
              )}

              {!media?.url && editable ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 text-center text-[11px] font-semibold tracking-[0.14em] text-slate-500">
                  DOUBLE CLICK
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      <div
        className={`absolute bottom-4 ${
          side === "left" ? "left-5" : "right-5"
        } rounded-full border border-slate-200 bg-white/92 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-500 shadow-sm`}
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
  title = "Our Album",
}: MemoryBookProps) {
  const [internalPage, setInternalPage] = useState(-1);
  const [turnState, setTurnState] = useState<TurnState>("idle");

  const controlled = typeof currentPage === "number";
  const activePage = normalizeSpread(
    controlled ? currentPage : internalPage,
    pageCount
  );

  const setPage = (page: number) => {
    const normalized = normalizeSpread(page, pageCount);
    if (onCurrentPageChange) {
      onCurrentPageChange(normalized);
    } else {
      setInternalPage(normalized);
    }
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
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-white/80" />
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
              <div className="relative flex-1 overflow-hidden border-r border-slate-200">
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