"use client";

import { EditorItem } from "@/lib/templates";

type Props = {
  selected: EditorItem | null;
  onUpdate: (id: string, patch: Partial<EditorItem>) => void;
};

export function EditorControls({ selected, onUpdate }: Props) {
  if (!selected) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
        Select a text or image block to edit.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-white">Selected: {selected.id}</p>
      </div>

      {selected.type === "text" ? (
        <>
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Text</span>
            <textarea
              value={selected.content ?? ""}
              onChange={(e) => onUpdate(selected.id, { content: e.target.value })}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Font size</span>
            <input
              type="range"
              min={16}
              max={64}
              value={selected.fontSize ?? 24}
              onChange={(e) => onUpdate(selected.id, { fontSize: Number(e.target.value) })}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Text color</span>
            <input
              type="color"
              value={selected.color ?? "#ffffff"}
              onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
            />
          </label>
        </>
      ) : (
        <p className="text-sm text-slate-300">Drag and resize the image block on the canvas.</p>
      )}
    </div>
  );
}