"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorItem } from "@/lib/templates";

type AnimationType =
  | "none"
  | "falling-hearts"
  | "falling-petals"
  | "sparkle-hearts";

type Props = {
  items: EditorItem[];
  background: string;
  coverImage?: string;
  animation?: AnimationType;
  onChange: (items: EditorItem[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onImageClick?: (id: string) => void;
};

type DragState = {
  id: string;
  startX: number;
  startY: number;
  itemX: number;
  itemY: number;
} | null;

type ResizeState = {
  id: string;
  startX: number;
  startY: number;
  itemW: number;
  itemH: number;
  itemX: number;
  itemY: number;
} | null;

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

      if (dragState) {
        const item = items.find((x) => x.id === dragState.id);
        if (!item) return;

        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;

        const nextX = Math.max(
          0,
          Math.min(dragState.itemX + dx, container.clientWidth - item.w)
        );
        const nextY = Math.max(
          0,
          Math.min(dragState.itemY + dy, container.clientHeight - item.h)
        );

        updateItem(dragState.id, { x: nextX, y: nextY });
      }

      if (resizeState) {
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
  }, [dragState, resizeState, items]);

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