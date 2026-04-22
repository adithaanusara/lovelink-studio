"use client";

import { useEffect, useMemo, useState } from "react";

export type BookPageMedia = {
  type: "image" | "video";
  url: string;
  poster?: string;
};

type MemoryBookProps = {
  pageCount: number;
  pages: BookPageMedia[];
  editable?: boolean;
  currentPage?: number;
  onCurrentPageChange?: (page: number) => void;
  onUploadPage?: (pageIndex: number) => void;
  width?: number;
  height?: number;
  coverImage?: string;
  title?: string;
};

type TurnState = "idle" | "opening" | "next" | "prev";

function normalizeSpread(page: number, pageCount: number) {
  if (page < 0) return -1;
  const safe = Math.max(0, Math.min(page, pageCount - 1));
  return safe % 2 === 0 ? safe : safe - 1;
}

function renderPageMedia(
  media: BookPageMedia | undefined,
  alt: string,
  editable: boolean,
  uploadHint: string
) {
  if (!media?.url) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center whitespace-pre-line text-sm text-slate-500">
        {editable ? uploadHint : alt}
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <video
        src={media.url}
        poster={media.poster}
        className="h-full w-full object-cover"
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
      className="h-full w-full object-cover"
      draggable={false}
    />
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
  title = "Our Memory Book"
}: MemoryBookProps) {
  const [internalPage, setInternalPage] = useState(-1);
  const [turnState, setTurnState] = useState<TurnState>("idle");

  const controlled = typeof currentPage === "number";
  const activePage = normalizeSpread(controlled ? currentPage : internalPage, pageCount);

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

  const leftMedia = leftIndex >= 0 ? pages[leftIndex] : undefined;
  const rightMedia = activePage >= 0 && leftIndex + 1 < pageCount ? pages[rightIndex] : undefined;

  const spreadDots = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < pageCount; i += 2) arr.push(i);
    return arr;
  }, [pageCount]);

  useEffect(() => {
    if (turnState === "idle") return;
    const timer = setTimeout(() => setTurnState("idle"), 720);
    return () => clearTimeout(timer);
  }, [turnState]);

  const openBook = () => {
    if (turnState !== "idle") return;
    setTurnState("opening");
    setTimeout(() => setPage(0), 300);
  };

  const flipNext = () => {
    if (turnState !== "idle") return;

    if (activePage < 0) {
      openBook();
      return;
    }

    setTurnState("next");
    const next = activePage + 2 >= pageCount ? -1 : activePage + 2;
    setTimeout(() => setPage(next), 320);
  };

  const flipPrev = () => {
    if (turnState !== "idle") return;

    if (activePage < 0) {
      const last = Math.max(0, pageCount % 2 === 0 ? pageCount - 2 : pageCount - 1);
      setTurnState("prev");
      setTimeout(() => setPage(last), 320);
      return;
    }

    setTurnState("prev");
    const prev = activePage - 2 < 0 ? -1 : activePage - 2;
    setTimeout(() => setPage(prev), 320);
  };

  const handleDoubleClickSpread = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || !onUploadPage || activePage < 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickedLeft = e.clientX < rect.left + rect.width / 2;
    const targetPage = clickedLeft ? leftIndex : rightIndex;

    if (targetPage >= 0 && targetPage < pageCount) {
      onUploadPage(targetPage);
    }
  };

  const singlePageWidth = width / 2;

  return (
    <div className="relative h-full w-full select-none">
      <style>{`
        @keyframes luxe-book-open {
          0% {
            transform: perspective(1800px) rotateY(0deg) translateX(0);
            opacity: 0.98;
          }
          100% {
            transform: perspective(1800px) rotateY(-112deg) translateX(-10px);
            opacity: 0;
          }
        }

        @keyframes luxe-page-next {
          0% {
            transform: perspective(1800px) rotateY(0deg);
            opacity: 0.98;
          }
          100% {
            transform: perspective(1800px) rotateY(-115deg);
            opacity: 0;
          }
        }

        @keyframes luxe-page-prev {
          0% {
            transform: perspective(1800px) rotateY(0deg);
            opacity: 0.98;
          }
          100% {
            transform: perspective(1800px) rotateY(115deg);
            opacity: 0;
          }
        }

        @keyframes glow-pulse-book {
          0%,100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>

      <div className="mb-3 flex items-center justify-between rounded-full border border-[#e9cc8f]/20 bg-[#1d1327]/75 px-4 py-2 text-xs text-[#f8e8bd] shadow-lg backdrop-blur-md">
        <span className="tracking-[0.28em] uppercase">Memory Book</span>
        <span>
          {activePage < 0
            ? "Cover"
            : `Page ${leftIndex + 1}${leftIndex + 1 < pageCount ? ` - ${rightIndex + 1}` : ""} / ${pageCount}`}
        </span>
      </div>

      <div className="relative" style={{ width, height }}>
        {activePage < 0 ? (
          <div
            className="relative"
            style={{
              width: singlePageWidth,
              height,
              margin: "0 auto"
            }}
          >
            <div className="absolute left-4 top-4 h-full w-full rounded-[2.8rem] bg-black/25 blur-md" />
            <div className="absolute left-2 top-2 h-full w-full rounded-[2.8rem] bg-white/5" />

            <div
              className="relative h-full w-full cursor-pointer overflow-hidden rounded-[2.9rem] border border-[#efcf8a]/25 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
              onClick={openBook}
              style={{
                background:
                  "linear-gradient(135deg, rgba(64,21,80,0.98) 0%, rgba(18,16,44,0.98) 55%, rgba(17,39,78,0.98) 100%)"
              }}
            >
              {coverImage ? (
                <>
                  <img
                    src={coverImage}
                    alt="Book cover"
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,8,30,0.58),rgba(5,10,22,0.76))]" />
                </>
              ) : null}

              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#7e5825] via-[#b48949] to-transparent" />
              <div className="absolute inset-y-8 left-6 w-[2px] rounded-full bg-white/20" />
              <div className="absolute inset-y-8 left-10 w-[1px] rounded-full bg-white/10" />

              <div
                className="absolute right-10 top-10 h-20 w-20 rounded-full bg-pink-400/10 blur-2xl"
                style={{ animation: "glow-pulse-book 2.6s ease-in-out infinite" }}
              />
              <div
                className="absolute bottom-12 left-20 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl"
                style={{ animation: "glow-pulse-book 3.2s ease-in-out infinite" }}
              />

              <div className="relative z-10 flex h-full flex-col justify-between px-12 py-14">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-[#f6dfb3]">
                    special memories
                  </p>
                  <h3 className="mt-6 text-3xl font-black leading-tight text-white md:text-4xl">
                    {title}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-white/85 md:text-base">
                    Tap to open this book and flip through your image and video memories.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full border border-white/15 bg-black/25 px-4 py-3 text-sm text-white/85 backdrop-blur-md">
                    Click to open
                  </div>
                  <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-[#f8e8bd]">
                    {pageCount} pages
                  </div>
                </div>
              </div>

              {turnState === "opening" ? (
                <div
                  className="absolute inset-0 z-30 origin-left rounded-[2.9rem] border border-[#efcf8a]/25 bg-[linear-gradient(135deg,rgba(57,22,68,0.98),rgba(16,18,42,0.98))] shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
                  style={{
                    animation: "luxe-book-open 720ms cubic-bezier(0.22,1,0.36,1) forwards"
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-[#efcf8a]/25 shadow-[0_34px_90px_rgba(0,0,0,0.5)]">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(58,35,88,0.96) 0%, rgba(18,16,40,0.98) 100%)"
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_25%)]" />

            <div className="absolute inset-y-0 left-0 z-10 w-[22px] bg-gradient-to-r from-[#7e5825]/90 to-transparent" />
            <div className="absolute inset-y-0 right-0 z-10 w-[22px] bg-gradient-to-l from-[#7e5825]/65 to-transparent" />
            <div className="absolute inset-y-0 left-1/2 z-20 w-[26px] -translate-x-1/2 bg-gradient-to-r from-black/25 via-white/10 to-black/25 shadow-[0_0_28px_rgba(0,0,0,0.35)]" />

            <div className="relative flex h-full w-full" onDoubleClick={handleDoubleClickSpread}>
              <div className="relative flex-1 overflow-hidden border-r border-black/10 bg-[#fbf4e8]">
                {renderPageMedia(
                  leftMedia,
                  `Page ${leftIndex + 1}`,
                  editable,
                  `Double click to add image or video\n(Page ${leftIndex + 1})`
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/5" />
                <div className="absolute bottom-4 left-5 rounded-full bg-black/35 px-3 py-1 text-xs text-white">
                  {leftIndex + 1}
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden bg-[#fff7eb]">
                {activePage >= 0 && leftIndex + 1 < pageCount ? (
                  renderPageMedia(
                    rightMedia,
                    `Page ${rightIndex + 1}`,
                    editable,
                    `Double click to add image or video\n(Page ${rightIndex + 1})`
                  )
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
                    End of story
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-black/5" />
                {leftIndex + 1 < pageCount ? (
                  <div className="absolute bottom-4 right-5 rounded-full bg-black/35 px-3 py-1 text-xs text-white">
                    {rightIndex + 1}
                  </div>
                ) : null}
              </div>

              {turnState === "next" ? (
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-1/2 origin-left rounded-r-[2rem] bg-[linear-gradient(135deg,rgba(255,248,235,0.96),rgba(245,232,209,0.96))] shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
                  style={{
                    animation: "luxe-page-next 720ms cubic-bezier(0.22,1,0.36,1) forwards"
                  }}
                />
              ) : null}

              {turnState === "prev" ? (
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/2 origin-right rounded-l-[2rem] bg-[linear-gradient(135deg,rgba(255,248,235,0.96),rgba(245,232,209,0.96))] shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
                  style={{
                    animation: "luxe-page-prev 720ms cubic-bezier(0.22,1,0.36,1) forwards"
                  }}
                />
              ) : null}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={flipPrev}
          className="absolute left-3 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-black/50"
        >
          Prev
        </button>

        <button
          type="button"
          onClick={flipNext}
          className="absolute right-3 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-black/50"
        >
          Next
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setPage(-1)}
          className={`h-2.5 w-2.5 rounded-full transition ${
            activePage < 0 ? "bg-pink-400" : "bg-white/30"
          }`}
          aria-label="Go to cover"
        />

        {spreadDots.map((spreadStart) => (
          <button
            key={spreadStart}
            type="button"
            onClick={() => setPage(spreadStart)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              activePage === spreadStart ? "bg-pink-400" : "bg-white/30"
            }`}
            aria-label={`Go to spread ${spreadStart + 1}`}
          />
        ))}
      </div>
    </div>
  );
}