"use client";

import { useMemo, useState } from "react";
import { editorTemplates, EditorItem, EditorTemplate } from "@/lib/templates";
import { LayoutEditor } from "@/components/LayoutEditor";
import { TemplateSelector } from "@/components/TemplateSelector";
import { EditorControls } from "@/components/EditorControls";

async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("Image upload failed");
  return response.json() as Promise<{ url: string }>;
}

export function AdvancedCreateForm() {
  const [template, setTemplate] = useState<EditorTemplate>(editorTemplates[0]);
  const [items, setItems] = useState<EditorItem[]>(
    editorTemplates[0].items.map((item) => ({ ...item }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [title, setTitle] = useState("For My Favorite Person");
  const [recipient, setRecipient] = useState("Sakuni");
  const [sender, setSender] = useState("Aditha");
  const [occasion, setOccasion] = useState("Birthday");
  const [message, setMessage] = useState("You are the most special person in my life.");
  const [musicUrl, setMusicUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const handleTemplateSelect = (next: EditorTemplate) => {
    setTemplate(next);
    setItems(next.items.map((item) => ({ ...item })));
    setSelectedId(null);
  };

  const updateSelected = (id: string, patch: Partial<EditorItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleCoverUpload = async (file: File) => {
    const result = await uploadToCloudinary(file);
    setCoverImage(result.url);

    setItems((current) => {
      let assigned = false;
      return current.map((item) => {
        if (item.type === "image" && !item.src && !assigned) {
          assigned = true;
          return { ...item, src: result.url };
        }
        return item;
      });
    });
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    const uploaded = await Promise.all(Array.from(files).map((file) => uploadToCloudinary(file)));

    setItems((current) => {
      let imageIndex = 0;
      return current.map((item) => {
        if (item.type === "image" && !item.src && uploaded[imageIndex]) {
          const nextItem = { ...item, src: uploaded[imageIndex].url };
          imageIndex += 1;
          return nextItem;
        }
        return item;
      });
    });
  };

  const handlePublish = async () => {
    setError("");
    setShareUrl("");

    if (!title.trim()) return setError("Enter a title");
    if (!recipient.trim()) return setError("Enter recipient");
    if (!sender.trim()) return setError("Enter sender");
    if (!message.trim()) return setError("Enter message");
    if (!coverImage.trim()) return setError("Upload a cover image");

    setSaving(true);

    try {
      const response = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          recipient,
          sender,
          occasion,
          message,
          accentText: "",
          musicUrl,
          eventDate: "",
          theme: "romantic",
          coverImage,
          gallery: items
            .filter((item) => item.type === "image" && item.src)
            .map((item) => ({
              imageUrl: item.src as string,
              altText: item.id
            })),
          layoutJson: {
            templateId: template.id,
            background: template.background,
            items,
            title,
            message
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Publish failed");
      }

      setShareUrl(data.shareUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <TemplateSelector
        templates={editorTemplates}
        activeId={template.id}
        onSelect={handleTemplateSelect}
      />

      <div className="grid gap-8 xl:grid-cols-[320px_1fr_320px]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-bold">Content</h2>

          <input
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              setTitle(value);
              if (items.find((i) => i.id === "title")) {
                updateSelected("title", { content: value });
              }
            }}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
            placeholder="Page title"
          />

          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
            placeholder="Recipient"
          />

          <input
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
            placeholder="Sender"
          />

          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
            placeholder="Occasion"
          />

          <textarea
            value={message}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
              if (items.find((i) => i.id === "message")) {
                updateSelected("message", { content: value });
              }
            }}
            className="min-h-36 w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
            placeholder="Message"
          />

          <input
            value={musicUrl}
            onChange={(e) => setMusicUrl(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
            placeholder="Music URL"
          />

          <div className="space-y-3">
            <label className="block text-sm text-slate-300">Cover image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleCoverUpload(file);
              }}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-slate-300">More images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => void handleGalleryUpload(e.target.files)}
            />
          </div>

          <button
            type="button"
            onClick={handlePublish}
            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-4 font-semibold"
          >
            {saving ? "Publishing..." : "Publish memory page"}
          </button>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          {shareUrl ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="break-all text-sm text-emerald-200">{shareUrl}</p>
            </div>
          ) : null}
        </div>

        <LayoutEditor
          items={items}
          background={template.background}
          onChange={setItems}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <EditorControls selected={selected} onUpdate={updateSelected} />
      </div>
    </div>
  );
}