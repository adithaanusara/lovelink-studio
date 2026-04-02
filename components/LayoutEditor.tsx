"use client";

import { Rnd } from "react-rnd";
import { EditorItem } from "@/lib/templates";

type Props = {
  items: EditorItem[];
  background: string;
  onChange: (items: EditorItem[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function LayoutEditor({
  items,
  background,
  onChange,
  selectedId,
  onSelect
}: Props) {
  const updateItem = (id: string, patch: Partial<EditorItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div
      className="relative mx-auto h-[560px] w-[900px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl"
      style={{ background }}
      onClick={() => onSelect(null)}
    >
      {items
        .slice()
        .sort((a, b) => a.z - b.z)
        .map((item) => (
          <Rnd
            key={item.id}
            size={{ width: item.w, height: item.h }}
            position={{ x: item.x, y: item.y }}
            bounds="parent"
            onDragStop={(_, d) => updateItem(item.id, { x: d.x, y: d.y })}
            onResizeStop={(_, __, ref, ___, position) =>
              updateItem(item.id, {
                w: parseInt(ref.style.width, 10),
                h: parseInt(ref.style.height, 10),
                x: position.x,
                y: position.y
              })
            }
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              onSelect(item.id);
            }}
            style={{
              border:
                selectedId === item.id
                  ? "2px solid #ec4899"
                  : "1px dashed rgba(255,255,255,0.2)",
              zIndex: item.z
            }}
          >
            {item.type === "text" ? (
              <div
                className="h-full w-full whitespace-pre-wrap rounded-xl p-3"
                style={{
                  color: item.color,
                  fontSize: item.fontSize,
                  fontWeight: item.fontWeight
                }}
              >
                {item.content}
              </div>
            ) : (
              <div className="h-full w-full overflow-hidden rounded-2xl bg-white/5">
                {item.src ? (
                  <img src={item.src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/50">
                    Select image
                  </div>
                )}
              </div>
            )}
          </Rnd>
        ))}
    </div>
  );
}