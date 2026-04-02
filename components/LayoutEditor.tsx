"use client";

import { useEffect, useRef, useState } from "react";
import { EditorItem } from "@/lib/templates";

type Props = {
  items: EditorItem[];
  background: string;
  coverImage?: string;
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
  direction: "bottom-right";
} | null;

export function LayoutEditor({
  items,
  background,
  coverImage,
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

        updateItem(dragState.id, {
          x: nextX,
          y: nextY
        });
      }

      if (resizeState) {
        const item = items.find((x) => x.id === resizeState.id);
        if (!item) return;

        const dx = e.clientX - resizeState.startX;
        const dy = e.clientY - resizeState.startY;

        const minWidth = 120;
        const minHeight = 60;

        const nextW = Math.max(
          minWidth,
          Math.min(resizeState.itemW + dx, container.clientWidth - resizeState.itemX)
        );

        const nextH = Math.max(
          minHeight,
          Math.min(resizeState.itemH + dy, container.clientHeight - resizeState.itemY)
        );

        updateItem(resizeState.id, {
          w: nextW,
          h: nextH
        });
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
      className="relative mx-auto h-[560px] w-[900px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl"
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

      {items
        .slice()
        .sort((a, b) => a.z - b.z)
        .map((item) => (
          <div
            key={item.id}
            className={`absolute overflow-hidden rounded-2xl ${
              selectedId === item.id
                ? "ring-2 ring-pink-500"
                : "ring-1 ring-white/10"
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
                  itemY: item.y,
                  direction: "bottom-right"
                });
              }}
              style={{ transform: "translate(35%, 35%)", cursor: "nwse-resize" }}
            />
          </div>
        ))}
    </div>
  );
}