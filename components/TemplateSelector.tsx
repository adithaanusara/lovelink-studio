"use client";

import { EditorTemplate } from "@/lib/templates";

type Props = {
  templates: EditorTemplate[];
  activeId: string;
  onSelect: (template: EditorTemplate) => void;
};

export function TemplateSelector({ templates, activeId, onSelect }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template)}
          className={`rounded-3xl border p-4 text-left transition ${
            activeId === template.id
              ? "border-pink-400 bg-pink-500/10"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="mb-3 h-28 rounded-2xl" style={{ background: template.background }} />
          <p className="font-semibold text-white">{template.name}</p>
        </button>
      ))}
    </div>
  );
}