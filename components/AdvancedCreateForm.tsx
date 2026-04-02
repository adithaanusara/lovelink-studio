"use client";

import { useMemo, useRef, useState } from "react";
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdvancedCreateForm() {
  const [template, setTemplate] = useState<EditorTemplate>(editorTemplates[0]);
  const [items, setItems] = useState<EditorItem[]>(
    editorTemplates[0].items.map((item) => ({ ...item }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [occasion, setOccasion] = useState("");
  const [customKeyword, setCustomKeyword] = useState("");

  const [coverImage, setCoverImage] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const replaceCoverInputRef = useRef<HTMLInputElement | null>(null);
  const pendingImageIdRef = useRef<string | null>(null);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const urlPreview = slugify(
    [
      recipient.trim(),
      occasion.trim(),
      sender.trim() ? `from ${sender.trim()}` : "",
      customKeyword.trim()
    ]
      .filter(Boolean)
      .join(" ")
  );

  const handleTemplateSelect = (next: EditorTemplate) => {
    setTemplate(next);
    setItems(next.items.map((item) => ({ ...item })));
    setSelectedId(null);
  };

  const updateItem = (id: string, patch: Partial<EditorItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
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
  };

  const handleImageUploadToSpecific = async (imageId: string, file: File) => {
    const result = await uploadToCloudinary(file);
    updateItem(imageId, { src: result.url });

    if (!coverImage) {
      setCoverImage(result.url);
    }
  };

  const handleSaveDetails = () => {
    if (!recipient.trim()) {
      setError("Enter recipient name");
      return;
    }

    if (!occasion.trim()) {
      setError("Enter occasion");
      return;
    }

    if (!sender.trim()) {
      setError("Enter sender name");
      return;
    }

    setDetailsSaved(true);
    setError("");
    setShowDetailsModal(false);
  };

  const handlePublish = async () => {
    setError("");
    setShareUrl("");
    setCopied(false);

    if (!detailsSaved) {
      setError("First click Customize URL and save the details.");
      return;
    }

    if (!coverImage.trim()) {
      setError("Upload at least one image");
      return;
    }

    if (!urlPreview) {
      setError("Please complete the URL details.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: `${recipient} ${occasion}`,
          recipient,
          sender,
          occasion,
          message: `${occasion} surprise for ${recipient}`,
          accentText: "",
          musicUrl: "",
          eventDate: "",
          theme: "romantic",
          coverImage,
          customSlugBase: urlPreview,
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

  const copyUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-4">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const imageId = pendingImageIdRef.current;
            if (file && imageId) {
              void handleImageUploadToSpecific(imageId, file);
            }
            e.currentTarget.value = "";
            pendingImageIdRef.current = null;
          }}
        />

        <input
          ref={replaceCoverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleCoverUpload(file);
            }
            e.currentTarget.value = "";
          }}
        />

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

            <div className="ml-auto flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setShowDetailsModal(true);
                }}
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold"
              >
                Customize URL
              </button>

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
              coverImage={coverImage}
              onChange={setItems}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onImageClick={(id) => {
                pendingImageIdRef.current = id;
                imageInputRef.current?.click();
              }}
            />
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-bold">Editor tools</h2>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={addTextBlock}
                className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15"
              >
                + Add text
              </button>

              <button
                type="button"
                onClick={addEmojiBlock}
                className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15"
              >
                + Add emoji
              </button>

              <button
                type="button"
                onClick={addEmptyImageBlock}
                className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15"
              >
                + Add image box
              </button>

              <button
                type="button"
                onClick={deleteSelected}
                className="w-full rounded-2xl bg-red-500/20 px-4 py-3 text-left text-sm font-medium text-red-200 transition hover:bg-red-500/30"
              >
                Delete selected item
              </button>

              <button
                type="button"
                onClick={() => replaceCoverInputRef.current?.click()}
                className="w-full rounded-2xl bg-gradient-to-r from-pink-500/20 to-violet-500/20 px-4 py-4 text-left text-sm font-medium text-white transition hover:from-pink-500/30 hover:to-violet-500/30"
              >
                Upload cover image
              </button>
            </div>

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

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showDetailsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0b1226] p-6 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-pink-200">Customize URL</p>
            <h3 className="mt-3 text-3xl font-bold text-white">Create a beautiful share link</h3>

            <div className="mt-6 grid gap-4">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-white"
                placeholder="Recipient name"
              />

              <input
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-white"
                placeholder="Occasion (Birthday, Valentine, Anniversary...)"
              />

              <input
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-white"
                placeholder="From name"
              />

              <input
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-white"
                placeholder="Optional custom keyword"
              />

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">
                  URL preview
                </p>
                <p className="mt-2 break-all text-sm text-emerald-100">
                  /{urlPreview || "your-custom-link"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveDetails}
                className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {shareUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-emerald-400/20 bg-[#0b1226] p-6 shadow-2xl">
            <p className="text-center text-sm uppercase tracking-[0.3em] text-emerald-200">
              Ready to share
            </p>

            <h3 className="mt-3 text-center text-3xl font-bold text-white">
              Your URL is ready
            </h3>

            <div className="mt-6 break-all rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-emerald-100">
              {shareUrl}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={copyUrl}
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white"
              >
                {copied ? "Copied" : "Copy URL"}
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                Open page
              </a>

              <button
                type="button"
                onClick={() => setShareUrl("")}
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}