"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorItem } from "@/lib/templates";
import { MemoryBook } from "@/components/MemoryBook";

type AnimationType =
  | "none"
  | "falling-hearts"
  | "falling-petals"
  | "sparkle-hearts";

type BookData = {
  enabled: boolean;
  pageCount: number;
  currentPage: number;
  pages: string[];
  x: number;
  y: number;
  w: number;
  h: number;
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
  onImageClick
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [resizeState, setResizeState] = useState<ResizeState>(null);

  const updateItem = (id: string, patch: Partial<EditorItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  useEffect(() => {
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
        const minWidth = 640;
        const minHeight = 340;
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
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, resizeState, items, book, onBookChange]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-[700px] w-[1100px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl"
      style={{ background }}
      onMouseDown={() => onSelect(null)}
    >
      {coverImage ? (
        <>
          <img
            src={coverImage}
            alt="Cover background"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/45" />
        </>
      ) : null}

      {animation === "falling-hearts" ? <FallingLayer type="falling-hearts" /> : null}
      {animation === "falling-petals" ? <FallingLayer type="falling-petals" /> : null}
      {animation === "sparkle-hearts" ? <SparkleHeartsLayer /> : null}

      {book?.enabled ? (
        <div
          className="absolute z-[70]"
          style={{
            left: book.x,
            top: book.y,
            width: book.w
          }}
        >
          <div
            className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#d6b36d]/20 bg-[#1d1327]/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#f4e7c3] shadow-lg backdrop-blur-md"
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragState({
                kind: "book",
                startX: e.clientX,
                startY: e.clientY,
                itemX: book.x,
                itemY: book.y
              });
            }}
            style={{ cursor: "move" }}
          >
            Drag book
          </div>

          <div style={{ width: book.w, height: book.h }}>
            <MemoryBook
              pageCount={book.pageCount}
              pages={book.pages}
              editable
              currentPage={book.currentPage}
              width={book.w}
              height={book.h}
              coverImage={coverImage}
              title="Our Memory Book"
              onCurrentPageChange={(page) => onBookFlip?.(page)}
              onUploadPage={(pageIndex) => onBookPageDoubleClick?.(pageIndex)}
            />
          </div>

          <button
            type="button"
            className="absolute bottom-0 right-0 z-[80] h-5 w-5 rounded-full bg-pink-500 shadow-lg"
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
            style={{
              transform: "translate(40%, 40%)",
              cursor: "nwse-resize"
            }}
          />
        </div>
      ) : null}

      {items
        .slice()
        .sort((a, b) => a.z - b.z)
        .map((item) => (
          <div
            key={item.id}
            className={`absolute overflow-hidden rounded-2xl ${
              selectedId === item.id ? "ring-2 ring-pink-500" : "ring-1 ring-white/10"
            }`}
            style={{
              left: item.x,
              top: item.y,
              width: item.w,
              height: item.h,
              zIndex: item.z,
              cursor: "move"
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelect(item.id);
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
                className="h-full w-full whitespace-pre-wrap rounded-2xl p-3 select-none"
                style={{
                  color: item.color,
                  fontSize: item.fontSize,
                  fontWeight: item.fontWeight,
                  pointerEvents: "none"
                }}
              >
                {item.content}
              </div>
            ) : (
              <div
                className="h-full w-full overflow-hidden rounded-2xl bg-white/5"
                style={{ pointerEvents: "none" }}
              >
                {item.src ? (
                  <img
                    src={item.src}
                    alt=""
                    className="h-full w-full object-cover select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/70">
                    Double click to select image
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-pink-500 shadow-lg"
              onMouseDown={(e) => {
                e.stopPropagation();
                onSelect(item.id);
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
              style={{ transform: "translate(35%, 35%)", cursor: "nwse-resize" }}
            />
          </div>
        ))}
    </div>
  );
}