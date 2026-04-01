"use client";

import { useMemo, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";

type GalleryItem = {
  imageUrl: string;
  altText: string;
};

const occasions = ["Birthday", "Valentine", "Anniversary", "Proposal", "Special Day"];
const themes = ["romantic", "dreamy", "elegant", "cute"];

async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Image upload failed.");
  }

  return response.json() as Promise<{ url: string }>;
}

export function CreateMemoryForm() {
  const [title, setTitle] = useState("For My Favorite Person");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [occasion, setOccasion] = useState("Birthday");
  const [message, setMessage] = useState("You make every ordinary day feel like magic.");
  const [accentText, setAccentText] = useState("Every memory with you is my favorite.");
  const [theme, setTheme] = useState("romantic");
  const [eventDate, setEventDate] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");

  const previewGallery = useMemo(() => gallery.filter((item) => item.imageUrl), [gallery]);

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const result = await uploadToCloudinary(file);
      setCoverImage(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload cover image.");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");

    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadToCloudinary(file)));
      setGallery((current) => [
        ...current,
        ...uploaded.map((item, index) => ({ imageUrl: item.url, altText: `Memory ${current.length + index + 1}` }))
      ]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload gallery images.");
    } finally {
      setUploading(false);
    }
  };

  const updateGalleryAlt = (index: number, value: string) => {
    setGallery((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, altText: value } : item)));
  };

  const removeGalleryImage = (index: number) => {
    setGallery((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setShareUrl("");

    if (!coverImage) {
      setError("Please upload a cover image before publishing.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          recipient,
          sender,
          occasion,
          message,
          accentText,
          theme,
          eventDate,
          musicUrl,
          coverImage,
          gallery: previewGallery
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create memory page.");
      }

      setShareUrl(data.shareUrl);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="glass rounded-[2rem] p-6 lg:p-8">
        <div className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-200">Builder</p>
          <h1 className="text-3xl font-bold">Create a surprise page</h1>
          <p className="text-slate-300">Fill the details, upload photos, and publish a beautiful memory URL.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Page title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Happy Birthday, Nethmi" required />
          </Field>
          <Field label="Occasion">
            <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="input">
              {occasions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Recipient name">
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="input" placeholder="Nethmi" required />
          </Field>
          <Field label="Sender name">
            <input value={sender} onChange={(e) => setSender(e.target.value)} className="input" placeholder="Aditha" required />
          </Field>
          <Field label="Special date">
            <input value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="input" type="date" />
          </Field>
          <Field label="Theme">
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="input">
              {themes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 grid gap-5">
          <Field label="Highlight line">
            <input
              value={accentText}
              onChange={(e) => setAccentText(e.target.value)}
              className="input"
              placeholder="Every memory with you is my favorite."
            />
          </Field>
          <Field label="Heartfelt message">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input min-h-36 resize-y"
              placeholder="Write your personal message here..."
              required
            />
          </Field>
          <Field label="Optional music URL">
            <input
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className="input"
              placeholder="https://open.spotify.com/..."
            />
          </Field>
        </div>

        <div className="mt-8 grid gap-5">
          <UploadBlock
            label="Cover image"
            helper="This is the first image the person will see."
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleCoverUpload(file);
            }}
          />

          <UploadBlock
            label="Gallery images"
            helper="Upload 2 to 6 beautiful memory photos."
            multiple
            onChange={(event) => void handleGalleryUpload(event.target.files)}
          />
        </div>

        {error ? <p className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-4 font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Publish memory page
        </button>
      </form>

      <aside className="space-y-5">
        <div className="glass rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold">Live content status</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Cover image: {coverImage ? "Uploaded" : "Waiting"}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Gallery images: {previewGallery.length}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Theme: {theme}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Occasion: {occasion}</div>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold">Preview assets</h2>
          <div className="mt-5 space-y-4">
            {coverImage ? <img src={coverImage} alt="Cover preview" className="h-56 w-full rounded-[1.5rem] object-cover" /> : <EmptyState />}
            {previewGallery.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {previewGallery.map((item, index) => (
                  <div key={`${item.imageUrl}-${index}`} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                    <img src={item.imageUrl} alt={item.altText} className="h-28 w-full rounded-xl object-cover" />
                    <input
                      value={item.altText}
                      onChange={(e) => updateGalleryAlt(index, e.target.value)}
                      className="input !rounded-xl !px-3 !py-2 text-xs"
                      placeholder="Image caption"
                    />
                    <button type="button" onClick={() => removeGalleryImage(index)} className="text-xs text-red-300">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {shareUrl ? (
          <div className="rounded-[2rem] border border-emerald-400/30 bg-emerald-500/10 p-6 text-emerald-100">
            <p className="text-sm uppercase tracking-[0.3em]">Published successfully</p>
            <p className="mt-3 break-all font-medium">{shareUrl}</p>
            <a href={shareUrl} target="_blank" className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">
              Open page
            </a>
          </div>
        ) : null}

        {uploading ? (
          <div className="rounded-[2rem] border border-pink-400/30 bg-pink-500/10 p-5 text-sm text-pink-100">
            Uploading images...
          </div>
        ) : null}
      </aside>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.9rem 1rem;
          color: white;
          outline: none;
        }
        .input:focus {
          border-color: rgba(236, 72, 153, 0.6);
          box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function UploadBlock({
  label,
  helper,
  multiple,
  onChange
}: {
  label: string;
  helper: string;
  multiple?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="rounded-[1.5rem] border border-dashed border-white/20 bg-white/5 p-5 transition hover:bg-white/10">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <UploadCloud className="h-5 w-5 text-pink-200" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{helper}</p>
          <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="mt-4 block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-pink-500/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-pink-100" />
        </div>
      </div>
    </label>
  );
}

function EmptyState() {
  return (
    <div className="flex h-56 items-center justify-center rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 text-sm text-slate-400">
      Upload a cover image to preview here.
    </div>
  );
}
