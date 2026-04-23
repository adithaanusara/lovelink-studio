"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorItem } from "@/lib/templates";
import { MemoryBook, BookPageMedia } from "@/components/MemoryBook";
import { FlappyBirdScene } from "@/components/FlappyBirdScene";
import { PuzzleGameScene } from "@/components/PuzzleGameScene";

type AnimationType =
  | "none"
  | "falling-hearts"
  | "falling-petals"
  | "sparkle-hearts";

type BookData = {
  enabled: boolean;
  pageCount: number;
  currentPage: number;
  pages: BookPageMedia[];
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
};

type Props = {
  items: EditorItem[];
  background: string;
  coverImage?: string;
  animation?: AnimationType;
  book?: BookData;
  onBookFlip?: (page: number) => void;
  onBookPageDoubleClick?: (pageIndex: number) => void;
  onBookChange?: (patch: Partial<BookData>) => void;
  onChange: (items: EditorItem[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onImageClick?: (id: string) => void;
  isGameScene?: boolean;
  challengeTarget?: number | null;
  isPuzzleScene?: boolean;
  puzzleImage?: string;
  puzzleTimeLimit?: number;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  onBackgroundPositionChange?: (
    patch: { backgroundPositionX: number; backgroundPositionY: number }
  ) => void;
};

type DragState =
  | {
      kind: "item";
      id: string;
      startX: number;
      startY: number;
      itemX: number;
      itemY: number;
    }
  | {
      kind: "book";
      startX: number;
      startY: number;
      itemX: number;
      itemY: number;
    }
  | null;

type ResizeState =
  | {
      kind: "item";
      id: string;
      startX: number;
      startY: number;
      itemW: number;
      itemH: number;
      itemX: number;
      itemY: number;
    }
  | {
      kind: "book";
      startX: number;
      startY: number;
      itemW: number;
      itemH: number;
      itemX: number;
      itemY: number;
    }
  | null;

type PanState =
  | {
      id: string;
      startX: number;
      startY: number;
      startPositionX: number;
      startPositionY: number;
      itemW: number;
      itemH: number;
    }
  | null;

type BackgroundPanState =
  | {
      startX: number;
      startY: number;
      startPositionX: number;
      startPositionY: number;
      containerW: number;
      containerH: number;
    }
  | null;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function FallingLayer({ type }: { type: AnimationType }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        delay: `${(i % 12) * 0.25}s`,
        duration: `${4.2 + (i % 5) * 0.55}s`,
        size: 14 + (i % 6) * 5,
        drift: -40 + (i % 9) * 10,
        rotate: 90 + (i % 8) * 35,
        opacity: 0.35 + (i % 4) * 0.12,
        symbol: type === "falling-petals" ? "✿" : "♥"
      })),
    [type]
  );

  if (type !== "falling-hearts" && type !== "falling-petals") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <style>{`
        @keyframes romantic-fall-dense {
          0% {
            transform: translate3d(0, -14vh, 0) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
          100% {
            transform: translate3d(var(--drift), 118vh, 0) rotate(var(--rotate)) scale(1.08);
            opacity: 0;
          }
        }
      `}</style>

      {particles.map((item) => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: "-16%",
            fontSize: `${item.size}px`,
            color: type === "falling-petals" ? "#f9a8d4" : "#fb7185",
            opacity: item.opacity,
            animationName: "romantic-fall-dense",
            animationDuration: item.duration,
            animationDelay: item.delay,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            filter:
              type === "falling-petals"
                ? "drop-shadow(0 0 10px rgba(249,168,212,0.35))"
                : "drop-shadow(0 0 10px rgba(251,113,133,0.35))",
            ["--drift" as string]: `${item.drift}px`,
            ["--rotate" as string]: `${item.rotate}deg`
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

function SparkleHeartsLayer() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${3 + ((i * 11) % 94)}%`,
        top: `${4 + ((i * 9) % 88)}%`,
        delay: `${(i % 8) * 0.18}s`,
        size: 10 + (i % 5) * 5
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <style>{`
        @keyframes sparkle-heart-dense {
          0%, 100% {
            transform: scale(0.7);
            opacity: 0.12;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }
      `}</style>

      {hearts.map((item) => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: item.top,
            fontSize: `${item.size}px`,
            color: "#fb7185",
            animationName: "sparkle-heart-dense",
            animationDuration: "1.5s",
            animationDelay: item.delay,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
            filter: "drop-shadow(0 0 12px rgba(251,113,133,0.5))"
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

export function LayoutEditor({
  items,
  background,
  coverImage,
  animation = "none",
  book,
  onBookFlip,
  onBookPageDoubleClick,
  onBookChange,
  onChange,
  selectedId,
  onSelect,
  onImageClick,
  isGameScene = false,
  challengeTarget = null,
  isPuzzleScene = false,
  puzzleImage,
  puzzleTimeLimit = 60,
  backgroundPositionX = 50,
  backgroundPositionY = 50,
  onBackgroundPositionChange
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [resizeState, setResizeState] = useState<ResizeState>(null);
  const [panState, setPanState] = useState<PanState>(null);
  const [backgroundPanState, setBackgroundPanState] = useState<BackgroundPanState>(null);

  // add this new one
  const [isBackgroundMoveMode, setIsBackgroundMoveMode] = useState(false);

  const updateItem = (id: string, patch: Partial<EditorItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  useEffect(() => {
    if (isGameScene || isPuzzleScene) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (dragState?.kind === "item") {
        const item = items.find((x) => x.id === dragState.id);
        if (!item) return;

        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;

        const nextX = Math.max(0, Math.min(dragState.itemX + dx, container.clientWidth - item.w));
        const nextY = Math.max(0, Math.min(dragState.itemY + dy, container.clientHeight - item.h));

        updateItem(dragState.id, { x: nextX, y: nextY });
      }

      if (dragState?.kind === "book" && book && onBookChange) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;

        const nextX = Math.max(0, Math.min(dragState.itemX + dx, container.clientWidth - book.w));
        const nextY = Math.max(0, Math.min(dragState.itemY + dy, container.clientHeight - book.h));

        onBookChange({ x: nextX, y: nextY });
      }

      if (resizeState?.kind === "item") {
        const minWidth = 120;
        const minHeight = 60;
        const dx = e.clientX - resizeState.startX;
        const dy = e.clientY - resizeState.startY;

        const nextW = Math.max(
          minWidth,
          Math.min(resizeState.itemW + dx, container.clientWidth - resizeState.itemX)
        );
        const nextH = Math.max(
          minHeight,
          Math.min(resizeState.itemH + dy, container.clientHeight - resizeState.itemY)
        );

        updateItem(resizeState.id, { w: nextW, h: nextH });
      }

      if (resizeState?.kind === "book" && book && onBookChange) {
        const minWidth = 360;
        const minHeight = 240;
        const dx = e.clientX - resizeState.startX;
        const dy = e.clientY - resizeState.startY;

        const nextW = Math.max(
          minWidth,
          Math.min(resizeState.itemW + dx, container.clientWidth - resizeState.itemX)
        );
        const nextH = Math.max(
          minHeight,
          Math.min(resizeState.itemH + dy, container.clientHeight - resizeState.itemY)
        );

        onBookChange({ w: nextW, h: nextH });
      }

      if (panState) {
        const dx = e.clientX - panState.startX;
        const dy = e.clientY - panState.startY;

        const nextPositionX = clamp(
          panState.startPositionX - (dx / Math.max(panState.itemW, 1)) * 100,
          0,
          100
        );

        const nextPositionY = clamp(
          panState.startPositionY - (dy / Math.max(panState.itemH, 1)) * 100,
          0,
          100
        );

        updateItem(panState.id, {
          imagePositionX: nextPositionX,
          imagePositionY: nextPositionY
        });
      }

      if (backgroundPanState && onBackgroundPositionChange) {
        const dx = e.clientX - backgroundPanState.startX;
        const dy = e.clientY - backgroundPanState.startY;

        const nextPositionX = clamp(
          backgroundPanState.startPositionX -
            (dx / Math.max(backgroundPanState.containerW, 1)) * 100,
          0,
          100
        );

        const nextPositionY = clamp(
          backgroundPanState.startPositionY -
            (dy / Math.max(backgroundPanState.containerH, 1)) * 100,
          0,
          100
        );

        onBackgroundPositionChange({
          backgroundPositionX: nextPositionX,
          backgroundPositionY: nextPositionY
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
      setPanState(null);
      setBackgroundPanState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragState,
    resizeState,
    panState,
    backgroundPanState,
    items,
    book,
    onBookChange,
    onBackgroundPositionChange,
    isGameScene,
    isPuzzleScene
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative isolate z-0 mx-auto aspect-[16/9] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 ${
        isBackgroundMoveMode ? "cursor-grab" : ""
      }`}
      style={{ background }}
      onMouseDown={(e) => {
        if (isBackgroundMoveMode && coverImage && onBackgroundPositionChange && containerRef.current) {
          e.stopPropagation();
          onSelect(null);

          setBackgroundPanState({
            startX: e.clientX,
            startY: e.clientY,
            startPositionX: backgroundPositionX,
            startPositionY: backgroundPositionY,
            containerW: containerRef.current.clientWidth,
            containerH: containerRef.current.clientHeight
          });
          return;
        }

        onSelect(null);
      }}
    >
      {isPuzzleScene ? (
        <PuzzleGameScene imageUrl={puzzleImage} timeLimitSeconds={puzzleTimeLimit} />
      ) : isGameScene ? (
        <FlappyBirdScene challengeTarget={challengeTarget} />
      ) : (
        <>
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt="Editor background"
                className="absolute inset-0 z-0 h-full w-full object-cover"
                draggable={false}
                style={{
                  objectPosition: `${backgroundPositionX}% ${backgroundPositionY}%`
                }}
              />
              <div className="absolute inset-0 z-0 bg-slate-950/40" />

              {/* add this new one */}
              <div className="absolute left-4 top-4 z-[30] flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBackgroundMoveMode((prev) => !prev);
                  }}
                  className={`rounded-full px-4 py-2 text-[12px] font-bold text-white backdrop-blur-sm ${
                    isBackgroundMoveMode ? "bg-pink-600/90" : "bg-black/55"
                  }`}
                >
                  {isBackgroundMoveMode ? "Background move: ON" : "Move background"}
                </button>

                {isBackgroundMoveMode ? (
                  <div className="rounded-full bg-black/55 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-sm">
                    Drag anywhere to adjust focus
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {animation === "falling-hearts" ? <FallingLayer type="falling-hearts" /> : null}
          {animation === "falling-petals" ? <FallingLayer type="falling-petals" /> : null}
          {animation === "sparkle-hearts" ? <SparkleHeartsLayer /> : null}

          {items
            .slice()
            .sort((a, b) => a.z - b.z)
            .map((item) => {
              const isSelected = selectedId === item.id;
              const imagePositionX = item.imagePositionX ?? 50;
              const imagePositionY = item.imagePositionY ?? 50;

              return (
                <div
                  key={item.id}
                  className={`absolute z-[10] ${item.type === "image" ? "overflow-hidden" : ""}`}
                  style={{
                    left: item.x,
                    top: item.y,
                    width: item.w,
                    height: item.h,
                    pointerEvents: isBackgroundMoveMode ? "none" : "auto"
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onSelect(item.id);

                    if (item.type === "image" && item.src) {
                      setPanState({
                        id: item.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        startPositionX: imagePositionX,
                        startPositionY: imagePositionY,
                        itemW: item.w,
                        itemH: item.h
                      });
                      return;
                    }

                    setDragState({
                      kind: "item",
                      id: item.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      itemX: item.x,
                      itemY: item.y
                    });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (item.type === "image") {
                      onImageClick?.(item.id);
                    }
                  }}
                >
                  {item.type === "text" ? (
                    <div
                      className="h-full w-full whitespace-pre-wrap rounded-2xl px-2 py-1"
                      style={{
                        fontSize: item.fontSize ?? 24,
                        color: item.color ?? "#ffffff",
                        fontWeight: item.fontWeight ?? 700,
                        textShadow: "0 6px 30px rgba(0,0,0,0.35)"
                      }}
                    >
                      {item.content}
                    </div>
                  ) : item.src ? (
                    <>
                      <img
                        src={item.src}
                        alt="Editor block"
                        className="h-full w-full rounded-[1.75rem] object-cover shadow-2xl"
                        draggable={false}
                        style={{
                          objectPosition: `${imagePositionX}% ${imagePositionY}%`
                        }}
                      />

                      {isSelected ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                          <div className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                            Drag image to adjust focus
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[1.75rem] border border-dashed border-white/30 bg-black/20 text-center text-sm text-white/70">
                      Double click to add image
                    </div>
                  )}

                  {isSelected ? (
                    <>
                      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] border-2 border-pink-400" />

                      {item.type === "image" ? (
                        <button
                          type="button"
                          className="absolute left-3 top-3 z-[13] rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setPanState(null);
                            setDragState({
                              kind: "item",
                              id: item.id,
                              startX: e.clientX,
                              startY: e.clientY,
                              itemX: item.x,
                              itemY: item.y
                            });
                          }}
                        >
                          Move box
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="absolute -bottom-3 -right-3 z-[12] h-6 w-6 rounded-full border-2 border-white bg-pink-500 shadow-lg"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeState({
                            kind: "item",
                            id: item.id,
                            startX: e.clientX,
                            startY: e.clientY,
                            itemW: item.w,
                            itemH: item.h,
                            itemX: item.x,
                            itemY: item.y
                          });
                        }}
                      />
                    </>
                  ) : null}
                </div>
              );
            })}

          {book?.enabled ? (
            <div
              className="absolute z-[20]"
              style={{
                left: book.x,
                top: book.y,
                width: book.w,
                height: book.h,
                pointerEvents: isBackgroundMoveMode ? "none" : "auto"
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onSelect(null);
                setDragState({
                  kind: "book",
                  startX: e.clientX,
                  startY: e.clientY,
                  itemX: book.x,
                  itemY: book.y
                });
              }}
            >
              <MemoryBook
                pageCount={book.pageCount}
                pages={book.pages}
                editable
                currentPage={book.currentPage}
                onCurrentPageChange={onBookFlip}
                onUploadPage={onBookPageDoubleClick}
                width={book.w}
                height={book.h}
                coverImage={coverImage}
                title={book.title}
              />

              <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] border border-amber-300/25" />
              <button
                type="button"
                className="absolute -bottom-3 -right-3 z-[21] h-6 w-6 rounded-full border-2 border-white bg-pink-500 shadow-lg"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setResizeState({
                    kind: "book",
                    startX: e.clientX,
                    startY: e.clientY,
                    itemW: book.w,
                    itemH: book.h,
                    itemX: book.x,
                    itemY: book.y
                  });
                }}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}