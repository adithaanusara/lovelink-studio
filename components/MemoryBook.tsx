"use client";

import { useEffect, useMemo, useState } from "react";

type MemoryBookProps = {
  pageCount: number;
  pages: string[];
  editable?: boolean;
  currentPage?: number; // -1 = cover page
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

export function MemoryBook({
  pageCount,
  pages,
  editable = false,
  currentPage,
  onCurrentPageChange,
  onUploadPage,
  width = 820,
  height = 440,
  coverImage,
  title = "Our Memory Book"
}: MemoryBookProps) {
  const [internalPage, setInternalPage] = useState(-1);
  const [turnState, setTurnState] = useState<TurnState>("idle");

  const controlled = typeof currentPage === "number";
  const activePage = normalizeSpread(controlled ? currentPage! : internalPage, pageCount);

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

  const leftImage = leftIndex >= 0 ? pages[leftIndex] || "" : "";
  const rightImage = leftIndex + 1 < pageCount ? pages[rightIndex] || "" : "";

  const spreadDots = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < pageCount; i += 2) arr.push(i);
    return arr;
  }, [pageCount]);

  useEffect(() => {
    if (turnState === "idle") return;
    const t = setTimeout(() => setTurnState("idle"), 620);
    return () => clearTimeout(t);
  }, [turnState]);

  const openBook = () => {
    if (turnState !== "idle") return;
    setTurnState("opening");
    setTimeout(() => {
      setPage(0);
    }, 280);
  };

  const flipNext = () => {
    if (turnState !== "idle") return;

    if (activePage < 0) {
      openBook();
      return;
    }

    setTurnState("next");
    const next = activePage + 2 >= pageCount ? -1 : activePage + 2;
    setTimeout(() => {
      setPage(next);
    }, 280);
  };

  const flipPrev = () => {
    if (turnState !== "idle") return;

    if (activePage < 0) {
      const last = Math.max(0, pageCount % 2 === 0 ? pageCount - 2 : pageCount - 1);
      setTurnState("prev");
      setTimeout(() => {
        setPage(last);
      }, 280);
      return;
    }

    setTurnState("prev");
    const prev = activePage - 2 < 0 ? -1 : activePage - 2;
    setTimeout(() => {
      setPage(prev);
    }, 280);
  };

  const handleDoubleClickSpread = (
    e: React.MouseEvent<HTMLDivElement>,
    allowRight = true
  ) => {
    if (!editable || !onUploadPage || activePage < 0) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const clickedLeft = e.clientX < rect.left + rect.width / 2;
    const targetPage = clickedLeft ? leftIndex : rightIndex;

    if (targetPage >= 0 && targetPage < pageCount) {
      if (!allowRight && !clickedLeft) return;
      onUploadPage(targetPage);
    }
  };

  const coverTitle = title || "Our Memory Book";

  return (
    <div className="relative h-full w-full select-none">
      <style>{`
        @keyframes book-open-overlay {
          0% { transform: perspective(1400px) rotateY(0deg); opacity: 0.96; }
          100% { transform: perspective(1400px) rotateY(-105deg); opacity: 0; }
        }

        @keyframes page-turn-next {
          0% { transform: perspective(1400px) rotateY(0deg); opacity: 0.94; }
          100% { transform: perspective(1400px) rotateY(-110deg); opacity: 0; }
        }

        @keyframes page-turn-prev {
          0% { transform: perspective(1400px) rotateY(0deg); opacity: 0.94; }
          100% { transform: perspective(1400px) rotateY(110deg); opacity: 0; }
        }
      `}</style>

      <div className="mb-3 flex items-center justify-between rounded-full border border-[#d6b36d]/20 bg-[#1d1327]/75 px-4 py-2 text-xs text-[#f4e7c3] shadow-lg backdrop-blur-md">
        <span className="tracking-[0.2em] uppercase">Memory Book</span>
        <span>
          {activePage < 0
            ? "Cover"
            : `Page ${leftIndex + 1}${leftIndex + 1 < pageCount ? ` - ${rightIndex + 1}` : ""} / ${pageCount}`}
        </span>
      </div>

      <div
        className="relative overflow-visible"
        style={{ width, height }}
      >
        {activePage < 0 ? (
          <div className="relative h-full w-full">
            <div className="absolute left-5 top-5 h-full w-full rounded-[2.6rem] bg-white/10 blur-[1px]" />
            <div className="absolute left-3 top-3 h-full w-full rounded-[2.6rem] bg-white/10" />
            <div
              className="relative h-full w-full cursor-pointer overflow-hidden rounded-[2.8rem] border border-[#e9cc8f]/20 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
              onClick={openBook}
              style={{
                background:
                  "linear-gradient(135deg, rgba(47,16,57,0.98) 0%, rgba(13,16,40,0.98) 60%, rgba(18,37,71,0.98) 100%)"
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
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(19,8,38,0.6),rgba(5,11,25,0.72))]" />
                </>
              ) : null}

              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#7a5422]/95 via-[#a2773b]/55 to-transparent" />

              <div className="absolute right-0 top-0 h-24 w-24 bg-white/10 [clip-path:polygon(100%_0,0_0,100%_100%)]" />
              <div className="absolute right-0 top-0 h-20 w-20 bg-white/20 [clip-path:polygon(100%_0,0_0,100%_100%)] blur-[1px]" />

              <div className="relative z-10 flex h-full flex-col justify-between px-16 py-14">
                <div>
                  <p className="text-xs uppercase tracking-[0.55em] text-[#f6dfb3]">
                    special edition
                  </p>
                  <h3 className="mt-6 max-w-[70%] text-4xl font-black leading-tight text-white md:text-5xl">
                    {coverTitle}
                  </h3>
                  <p className="mt-4 max-w-[65%] text-base leading-7 text-white/80">
                    Tap to open this memory book and turn the pages.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="rounded-full border border-white/15 bg-black/25 px-5 py-3 text-sm text-white/85 backdrop-blur-md">
                    Click to open
                  </div>
                  <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-[#f4e7c3]">
                    {pageCount} pages
                  </div>
                </div>
              </div>

              {turnState === "opening" ? (
                <div
                  className="absolute inset-0 z-30 origin-left rounded-[2.8rem] border border-[#e9cc8f]/20 bg-[linear-gradient(135deg,rgba(57,22,68,0.98),rgba(17,18,42,0.98))] shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
                  style={{
                    animation: "book-open-overlay 620ms ease-in-out forwards"
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] border border-[#e7c98d]/20 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(58,35,88,0.95) 0%, rgba(19,16,40,0.98) 100%)"
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_25%)]" />

            <div className="absolute inset-y-0 left-0 z-10 w-[22px] bg-gradient-to-r from-[#7a5422]/85 to-transparent" />
            <div className="absolute inset-y-0 right-0 z-10 w-[22px] bg-gradient-to-l from-[#7a5422]/60 to-transparent" />
            <div className="absolute inset-y-0 left-1/2 z-20 w-[22px] -translate-x-1/2 bg-gradient-to-r from-black/25 via-white/10 to-black/25 shadow-[0_0_25px_rgba(0,0,0,0.3)]" />

            <div className="relative flex h-full w-full">
              <div className="relative flex-1 overflow-hidden border-r border-white/5 bg-[#f8efe0]">
                {leftImage ? (
                  <img
                    src={leftImage}
                    alt={`Page ${leftIndex + 1}`}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center whitespace-pre-line text-sm text-slate-500">
                    {editable
                      ? `Double click to add image\n(Page ${leftIndex + 1})`
                      : `Page ${leftIndex + 1}`}
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10" />
                <div className="absolute bottom-4 left-5 rounded-full bg-black/35 px-3 py-1 text-xs text-white">
                  {leftIndex + 1}
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden bg-[#fbf4e8]">
                {leftIndex + 1 < pageCount ? (
                  rightImage ? (
                    <img
                      src={rightImage}
                      alt={`Page ${rightIndex + 1}`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center whitespace-pre-line text-sm text-slate-500">
                      {editable
                        ? `Double click to add image\n(Page ${rightIndex + 1})`
                        : `Page ${rightIndex + 1}`}
                    </div>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    End page
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/5 via-transparent to-black/10" />
                {leftIndex + 1 < pageCount ? (
                  <div className="absolute bottom-4 right-5 rounded-full bg-black/35 px-3 py-1 text-xs text-white">
                    {rightIndex + 1}
                  </div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                flipPrev();
              }}
              className="absolute left-4 top-1/2 z-30 h-11 w-11 -translate-y-1/2 rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                flipNext();
              }}
              className="absolute right-4 top-1/2 z-30 h-11 w-11 -translate-y-1/2 rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
            >
              ›
            </button>

            <div
              className="absolute inset-0 z-20"
              onDoubleClick={(e) => handleDoubleClickSpread(e)}
            />

            {turnState === "next" ? (
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-40 w-1/2 origin-left bg-[linear-gradient(90deg,rgba(255,255,255,0.88),rgba(247,236,217,0.96))] shadow-[-18px_0_35px_rgba(0,0,0,0.15)]"
                style={{ animation: "page-turn-next 620ms ease-in-out forwards" }}
              />
            ) : null}

            {turnState === "prev" ? (
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-40 w-1/2 origin-right bg-[linear-gradient(270deg,rgba(255,255,255,0.88),rgba(247,236,217,0.96))] shadow-[18px_0_35px_rgba(0,0,0,0.15)]"
                style={{ animation: "page-turn-prev 620ms ease-in-out forwards" }}
              />
            ) : null}

            <div className="pointer-events-none absolute inset-0 rounded-[2.4rem] ring-1 ring-white/10" />
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPage(-1);
          }}
          className={`h-2.5 rounded-full transition ${
            activePage < 0 ? "w-8 bg-pink-500" : "w-2.5 bg-white/25"
          }`}
        />
        {spreadDots.map((pageIndex) => (
          <button
            key={pageIndex}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPage(pageIndex);
            }}
            className={`h-2.5 rounded-full transition ${
              activePage === pageIndex ? "w-8 bg-pink-500" : "w-2.5 bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}