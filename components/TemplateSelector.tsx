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
              ? "border-pink-400 bg-pink-100/70"
              : "border-sky-400/70 bg-sky-100/90 hover:bg-sky-200"
          }`}
        >
          <div className="mb-3 h-28 rounded-2xl" style={{ background: template.background }} />
          <p className="font-semibold text-slate-900">{template.name}</p>
        </button>
      ))}
    </div>
  );
}