"use client";

import { useMemo, useState } from "react";
import { editorTemplates, EditorItem, EditorTemplate } from "@/lib/templates";
import { LayoutEditor } from "@/components/LayoutEditor";

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

function uid() {
  return Math.random().toString(36).slice(2, 10);
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

  const updateItem = (id: string, patch: Partial<EditorItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addTextBlock = () => {
    const newItem: EditorItem = {
      id: `text-${uid()}`,
      type: "text",
      x: 120,
      y: 120,
      w: 260,
      h: 90,
      z: items.length + 1,
      content: "New text",
      fontSize: 28,
      color: "#ffffff",
      fontWeight: 700
    };

    setItems((current) => [...current, newItem]);
    setSelectedId(newItem.id);
  };

  const addEmojiBlock = () => {
    const newItem: EditorItem = {
      id: `emoji-${uid()}`,
      type: "text",
      x: 160,
      y: 160,
      w: 120,
      h: 80,
      z: items.length + 1,
      content: "💖",
      fontSize: 42,
      color: "#ffffff",
      fontWeight: 400
    };

    setItems((current) => [...current, newItem]);
    setSelectedId(newItem.id);
  };

  const addEmptyImageBlock = () => {
    const newItem: EditorItem = {
      id: `image-${uid()}`,
      type: "image",
      x: 220,
      y: 220,
      w: 220,
      h: 220,
      z: items.length + 1,
      src: ""
    };

    setItems((current) => [...current, newItem]);
    setSelectedId(newItem.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setItems((current) => current.filter((item) => item.id !== selectedId));
    setSelectedId(null);
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

  const handleImageUploadToSelected = async (file: File) => {
    if (!selected || selected.type !== "image") return;

    const result = await uploadToCloudinary(file);
    updateItem(selected.id, { src: result.url });

    if (!coverImage) {
      setCoverImage(result.url);
    }
  };

  const handlePublish = async () => {
    setError("");
    setShareUrl("");

    if (!title.trim()) return setError("Enter a title");
    if (!recipient.trim()) return setError("Enter recipient");
    if (!sender.trim()) return setError("Enter sender");
    if (!message.trim()) return setError("Enter message");
    if (!coverImage.trim()) return setError("Upload at least one image");

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
            items
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
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-4">
        <div className="mb-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            {editorTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleTemplateSelect(tpl)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  tpl.id === template.id
                    ? "bg-pink-500 text-white"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {tpl.name}
              </button>
            ))}

            <div className="mx-2 h-8 w-px bg-white/10" />

            <button
              type="button"
              onClick={addTextBlock}
              className="rounded-full bg-white/10 px-4 py-2 text-sm"
            >
              + Text
            </button>

            <button
              type="button"
              onClick={addEmojiBlock}
              className="rounded-full bg-white/10 px-4 py-2 text-sm"
            >
              + Emoji
            </button>

            <button
              type="button"
              onClick={addEmptyImageBlock}
              className="rounded-full bg-white/10 px-4 py-2 text-sm"
            >
              + Image box
            </button>

            <button
              type="button"
              onClick={deleteSelected}
              className="rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-200"
            >
              Delete selected
            </button>

            <div className="mx-2 h-8 w-px bg-white/10" />

            <label className="rounded-full bg-white/10 px-4 py-2 text-sm cursor-pointer">
              Upload cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleCoverUpload(file);
                }}
              />
            </label>

            {selected?.type === "image" ? (
              <label className="rounded-full bg-white/10 px-4 py-2 text-sm cursor-pointer">
                Fill selected image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageUploadToSelected(file);
                  }}
                />
              </label>
            ) : null}

            <div className="ml-auto flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePublish}
                className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-3 text-sm font-semibold"
              >
                {saving ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <LayoutEditor
              items={items}
              background={template.background}
              onChange={setItems}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-bold">Story settings</h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
              placeholder="Title"
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
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
              placeholder="Message"
            />

            <input
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
              placeholder="Music URL"
            />

            {selected?.type === "text" ? (
              <div className="space-y-3 rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4">
                <p className="font-semibold">Selected text block</p>

                <textarea
                  value={selected.content ?? ""}
                  onChange={(e) => updateItem(selected.id, { content: e.target.value })}
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
                />

                <label className="grid gap-2 text-sm text-slate-300">
                  Font size
                  <input
                    type="range"
                    min={16}
                    max={72}
                    value={selected.fontSize ?? 24}
                    onChange={(e) =>
                      updateItem(selected.id, { fontSize: Number(e.target.value) })
                    }
                  />
                </label>

                <label className="grid gap-2 text-sm text-slate-300">
                  Color
                  <input
                    type="color"
                    value={selected.color ?? "#ffffff"}
                    onChange={(e) => updateItem(selected.id, { color: e.target.value })}
                  />
                </label>

                <label className="grid gap-2 text-sm text-slate-300">
                  Weight
                  <input
                    type="range"
                    min={300}
                    max={900}
                    step={100}
                    value={selected.fontWeight ?? 700}
                    onChange={(e) =>
                      updateItem(selected.id, { fontWeight: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
            ) : null}

            {selected?.type === "image" ? (
              <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">
                Select image block eka drag / resize karanna. Image eka maru karanna toolbar eke
                <span className="font-semibold"> Fill selected image </span>
                use karanna.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {shareUrl ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="mb-2 text-sm font-semibold text-emerald-100">Published</p>
                <p className="break-all text-sm text-emerald-200">{shareUrl}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}