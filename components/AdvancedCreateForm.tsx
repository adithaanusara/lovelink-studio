"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  ImagePlus,
  Link2,
  Loader2,
  Send,
  Smile,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { editorTemplates, EditorItem, EditorTemplate } from "@/lib/templates";
import { DESIGN_WIDTH, LayoutEditor, STAGE_HEIGHT } from "@/components/LayoutEditor";
import { BookPageMedia } from "@/components/MemoryBook";
import { Logo } from "@/components/Logo";

type AnimationType =
  | "none"
  | "falling-hearts"
  | "falling-petals"
  | "sparkle-hearts";

type BookData = {
  enabled: boolean;
  pageCount: number;
  currentPage: number;
  pages: BookPageMedia[];
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  coverImage?: string;
  coverPositionX?: number;
  coverPositionY?: number;
};

type StoryScene = {
  id: string;
  name: string;
  background: string;
  backgroundImage: string;
  items: EditorItem[];
  book?: BookData;
  gameChallengeTarget?: number | null;
  puzzleImage?: string;
  puzzleTimeLimit?: number;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
};

async function uploadMedia(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || typeof data?.url !== "string" || !["image", "video"].includes(data?.resourceType)) {
    throw new Error(data?.error || "Media upload failed");
  }

  return data as {
    url: string;
    resourceType: "image" | "video";
    poster?: string;
  };
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

function cloneTemplateItems(template: EditorTemplate, sceneIndex: number) {
  return template.items.map((item) => ({
    ...item,
    id: `${item.id}-${sceneIndex}-${uid()}`,
  }));
}

function createScene(template: EditorTemplate, index: number): StoryScene {
  return {
    id: `scene-${index + 1}`,
    name: `Background ${index + 1}`,
    background: template.background,
    backgroundImage: "",
    items: cloneTemplateItems(template, index),
    gameChallengeTarget: index === 2 ? 10 : null,
    puzzleImage: "",
    puzzleTimeLimit: index === 3 ? 60 : 60,
    backgroundPositionX: 50,
    backgroundPositionY: 50,
  };
}

function randomLayoutId() {
  return Math.floor(Math.random() * 4);
}

function slotCountFromLayout(layoutId: number) {
  const counts = [1, 2, 3, 4];
  return counts[layoutId] ?? 1;
}

function makeDefaultBook(title: string, pageCount: 4 | 6 | 8): BookData {
  return {
    enabled: true,
    pageCount,
    currentPage: -1,
    pages: Array.from({ length: pageCount }, () => {
      const layoutId = randomLayoutId();
      return {
        layoutId,
        slots: Array.from(
          { length: slotCountFromLayout(layoutId) },
          () => null,
        ),
      };
    }),
    x: 170,
    y: 180,
    w: 760,
    h: 460,
    title,
    coverImage: "",
    coverPositionX: 50,
    coverPositionY: 50,
  };
}

export function AdvancedCreateForm() {
  const [template, setTemplate] = useState<EditorTemplate>(editorTemplates[0]);
  const [scenes, setScenes] = useState<StoryScene[]>(() =>
    [0, 1, 2, 3].map((index) => createScene(editorTemplates[0], index)),
  );
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [occasion, setOccasion] = useState("");
  const [customKeyword, setCustomKeyword] = useState("");

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const [animation, setAnimation] = useState<AnimationType>("none");

  const [showBookOptions, setShowBookOptions] = useState(false);
  const [bookTitleInput, setBookTitleInput] = useState("Our Album");

  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploads, setUploads] = useState(0);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const sceneBackgroundInputRef = useRef<HTMLInputElement | null>(null);
  const pendingImageIdRef = useRef<string | null>(null);

  const bookMediaInputRef = useRef<HTMLInputElement | null>(null);
  const bookCoverInputRef = useRef<HTMLInputElement | null>(null);
  const pendingBookSlotRef = useRef<number | null>(null);
  const puzzleImageInputRef = useRef<HTMLInputElement | null>(null);

  // Same upload as before, counted so the editor can show that a file is on its way.
  const uploadWithProgress = async (file: File) => {
    setUploads((count) => count + 1);

    try {
      return await uploadMedia(file);
    } finally {
      setUploads((count) => Math.max(0, count - 1));
    }
  };

  const dialogOpen = showDetailsModal || Boolean(shareUrl);

  useEffect(() => {
    if (!dialogOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDetailsModal) {
        setShowDetailsModal(false);
        setError("");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dialogOpen, showDetailsModal]);

  const activeScene = scenes[activeSceneIndex] ?? scenes[0];
  const items = activeScene?.items ?? [];
  const isGameScene = activeSceneIndex === 2;
  const isPuzzleScene = activeSceneIndex === 3;

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const urlPreview = slugify(
    [
      recipient.trim(),
      occasion.trim(),
      sender.trim() ? `from ${sender.trim()}` : "",
      customKeyword.trim(),
    ]
      .filter(Boolean)
      .join(" "),
  );

  const updateScenes = (updater: (current: StoryScene[]) => StoryScene[]) => {
    setScenes((current) => updater(current));
  };

  const updateActiveScene = (patch: Partial<StoryScene>) => {
    updateScenes((current) =>
      current.map((scene, index) =>
        index === activeSceneIndex ? { ...scene, ...patch } : scene,
      ),
    );
  };

  const setActiveSceneItems = (nextItems: EditorItem[]) => {
    updateActiveScene({ items: nextItems });
  };

  const updateItem = (id: string, patch: Partial<EditorItem>) => {
    setActiveSceneItems(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const updateActiveBook = (patch: Partial<BookData>) => {
    updateScenes((current) =>
      current.map((scene, index) =>
        index === activeSceneIndex && scene.book
          ? {
              ...scene,
              book: {
                ...scene.book,
                ...patch,
              },
            }
          : scene,
      ),
    );
  };

  const makeHeroImageSameAsTitle = (sourceItems: EditorItem[]) => {
    const titleBox = sourceItems.find((item) => item.id.includes("title"));
    const heroImageBox = sourceItems.find((item) =>
      item.id.includes("hero-image"),
    );

    if (!titleBox || !heroImageBox) return sourceItems;

    return sourceItems.map((item) =>
      item.id === heroImageBox.id
        ? {
            ...item,
            w: titleBox.w,
            h: titleBox.h,
          }
        : item,
    );
  };

  const handleTemplateSelect = (next: EditorTemplate) => {
    setTemplate(next);
    setScenes((current) =>
      current.map((scene, index) => ({
        ...scene,
        background: next.background,
        items: makeHeroImageSameAsTitle(cloneTemplateItems(next, index)),
      })),
    );
    setSelectedId(null);
  };

  const addTextBlock = () => {
    if (isGameScene || isPuzzleScene) return;

    const newItem: EditorItem = {
      id: `text-${uid()}`,
      type: "text",
      x: 120,
      y: 120,
      w: 360,
      h: 260,
      z: items.length + 1,
      content: "New text",
      fontSize: 28,
      color: "#ffffff",
      fontWeight: 700,
    };

    setActiveSceneItems([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const addEmojiBlock = () => {
    if (isGameScene || isPuzzleScene) return;

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
      fontWeight: 400,
    };

    setActiveSceneItems([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const addEmptyImageBlock = () => {
    if (isGameScene || isPuzzleScene) return;

    const newItem: EditorItem = {
      id: `image-${uid()}`,
      type: "image",
      x: 500,
      y: 90,
      w: 400,
      h: 280,
      z: items.length + 1,
      src: "",
    };

    setActiveSceneItems([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const deleteSelected = () => {
    if (isGameScene || isPuzzleScene) return;
    if (!selectedId) return;

    setActiveSceneItems(items.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  const handleSceneBackgroundUpload = async (file: File) => {
    const result = await uploadWithProgress(file);
    if (result.resourceType !== "image") {
      setError("Only images can be used as a scene background.");
      return;
    }

    updateScenes((current) =>
      current.map((scene, index) =>
        index === activeSceneIndex
          ? {
              ...scene,
              backgroundImage: result.url,
              backgroundPositionX: 50,
              backgroundPositionY: 50,
            }
          : scene,
      ),
    );

    setError("");
  };

  const handleImageUploadToSpecific = async (imageId: string, file: File) => {
    if (isGameScene || isPuzzleScene) return;

    const result = await uploadWithProgress(file);
    if (result.resourceType !== "image") {
      setError("Only images can be added to normal image boxes.");
      return;
    }

    updateScenes((current) => current.map((scene) => scene.id === activeScene.id
      ? { ...scene, items: scene.items.map((item) => item.id === imageId ? { ...item, src: result.url } : item) }
      : scene));
    setError("");
  };

  const createBook = (pageCount: 4 | 6 | 8) => {
    if (isGameScene || isPuzzleScene) return;

    updateActiveScene({
      book: makeDefaultBook(
        bookTitleInput || `${activeScene.name} Album`,
        pageCount,
      ),
    });
    setShowBookOptions(false);
  };

  const removeBook = () => {
    if (isGameScene || isPuzzleScene) return;

    updateActiveScene({ book: undefined });
    setShowBookOptions(false);
  };

  const handleBookFlip = (page: number) => {
    if (isGameScene || isPuzzleScene) return;
    if (!activeScene.book) return;

    updateActiveBook({ currentPage: page });
  };

  const handleBookPageUpload = async (encodedSlotIndex: number, file: File) => {
    if (isGameScene || isPuzzleScene) return;

    const result = await uploadWithProgress(file);
    if (!activeScene.book) return;

    const pageIndex = Math.floor(encodedSlotIndex / 10);
    const slotIndex = encodedSlotIndex % 10;

    if (!activeScene.book.pages[pageIndex]) return;

    updateScenes((current) => current.map((scene) => {
      if (scene.id !== activeScene.id || !scene.book) return scene;
      return { ...scene, book: { ...scene.book, pages: scene.book.pages.map((page, index) =>
        index !== pageIndex ? page : { ...page, slots: page.slots.map((slot, index) =>
          index !== slotIndex ? slot : { type: result.resourceType, url: result.url, poster: result.poster }
        ) }
      ) } };
    }));
    setError("");
  };

  const handleBookCoverUpload = async (file: File) => {
    if (isGameScene || isPuzzleScene) return;

    const result = await uploadWithProgress(file);
    if (result.resourceType !== "image") {
      setError("Only images can be used as the album cover.");
      return;
    }

    if (!activeScene.book) return;

    updateScenes((current) => current.map((scene) => scene.id === activeScene.id && scene.book
      ? { ...scene, book: { ...scene.book, coverImage: result.url, coverPositionX: 50, coverPositionY: 50 } }
      : scene));
    setError("");
  };

  const handleChallengeTargetChange = (value: string) => {
    const trimmed = value.trim();

    if (trimmed === "") {
      updateActiveScene({ gameChallengeTarget: null });
      return;
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) return;

    updateActiveScene({
      gameChallengeTarget: Math.max(1, Math.floor(numeric)),
    });
  };

  const handlePuzzleImageUpload = async (file: File) => {
    const result = await uploadWithProgress(file);

    if (result.resourceType !== "image") {
      setError("Only images can be used for the puzzle game.");
      return;
    }

    updateActiveScene({
      puzzleImage: result.url,
    });

    setError("");
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
    if (saving) return;
    if (uploads > 0) {
      setError("Wait for all uploads to finish before publishing.");
      return;
    }
    setError("");
    setShareUrl("");
    setCopied(false);

    if (!detailsSaved) {
      setError("First click Customize URL and save the details.");
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
          "Content-Type": "application/json",
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
          coverImage:
            scenes[0]?.backgroundImage ||
            scenes[0]?.items.find((item) => item.type === "image" && item.src)
              ?.src ||
            "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
          customSlugBase: urlPreview,
          gallery: scenes.flatMap((scene, sceneIndex) => [
            ...(sceneIndex === 2 || sceneIndex === 3
              ? []
              : scene.items
                  .filter((item) => item.type === "image" && item.src)
                  .map((item) => ({
                    imageUrl: item.src as string,
                    altText: item.id,
                  }))),
            ...(sceneIndex === 2 || sceneIndex === 3
              ? []
              : scene.book?.pages.flatMap((page, pageIndex) =>
                  page.slots
                    .filter((slot): slot is NonNullable<typeof slot> =>
                      Boolean(slot?.url),
                    )
                    .map((slot, slotIndex) => ({
                      imageUrl: slot.url,
                      altText: `${scene.name}-album-page-${pageIndex + 1}-slot-${slotIndex + 1}`,
                    })),
                ) || []),
          ]),
          layoutJson: {
            templateId: template.id,
            background: template.background,
            items: scenes[0]?.items ?? [],
            animation,
            storyScenes: scenes,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || typeof data?.shareUrl !== "string") {
        throw new Error(data?.error || "Publish failed. Please try again.");
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

  const itemLabel = (item: EditorItem) => {
    if (item.type === "image") return item.src ? "Photo" : "Empty image box";

    const text = (item.content ?? "").replace(/\s+/g, " ").trim();
    if (!text) return "Empty text";

    return text.length > 22 ? `${text.slice(0, 22)}...` : text;
  };

  const sceneTag = (index: number) =>
    index === 2 ? "Bird game" : index === 3 ? "Puzzle" : null;

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setError("");
  };

  const toolButton =
    "flex min-h-[44px] w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50";

  const animationSelector = (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label
        htmlFor="animation-selector"
        className="mb-2 block text-sm font-bold text-slate-800"
      >
        Animation selector
      </label>
      <select
        id="animation-selector"
        value={animation}
        onChange={(e) => setAnimation(e.target.value as AnimationType)}
        className="field"
      >
        <option value="none">No animation</option>
        <option value="falling-hearts">Falling hearts</option>
        <option value="falling-petals">Falling petals</option>
        <option value="sparkle-hearts">Sparkle hearts</option>
      </select>
    </div>
  );

  return (
    <main className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Logo compact />
            <span className="hidden border-l border-slate-200 pl-3 text-sm font-semibold text-slate-500 md:block">
              Page editor
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setError("");
                setShowDetailsModal(true);
              }}
              className="btn btn-secondary px-4"
            >
              {detailsSaved ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              <span className="hidden min-[420px]:inline">Customize URL</span>
              <span className="min-[420px]:hidden">URL</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={saving || uploads > 0}
              className="btn btn-primary px-4 sm:px-5"
            >
              <Send className="h-4 w-4" />
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] flex-col px-3 pb-28 pt-4 sm:px-4">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const imageId = pendingImageIdRef.current;

            if (file && imageId) {
              void handleImageUploadToSpecific(imageId, file).catch((err) => {
                setError(
                  err instanceof Error ? err.message : "Media upload failed",
                );
              });
            }

            e.currentTarget.value = "";
            pendingImageIdRef.current = null;
          }}
        />

        <input
          ref={sceneBackgroundInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              void handleSceneBackgroundUpload(file).catch((err) => {
                setError(
                  err instanceof Error ? err.message : "Media upload failed",
                );
              });
            }

            e.currentTarget.value = "";
          }}
        />

        <input
          ref={bookMediaInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const encodedSlotIndex = pendingBookSlotRef.current;

            if (file && encodedSlotIndex !== null) {
              void handleBookPageUpload(encodedSlotIndex, file).catch((err) => {
                setError(
                  err instanceof Error ? err.message : "Media upload failed",
                );
              });
            }

            e.currentTarget.value = "";
            pendingBookSlotRef.current = null;
          }}
        />

        <input
          ref={bookCoverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              void handleBookCoverUpload(file).catch((err) => {
                setError(
                  err instanceof Error ? err.message : "Media upload failed",
                );
              });
            }

            e.currentTarget.value = "";
          }}
        />

        <input
          ref={puzzleImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              void handlePuzzleImageUpload(file).catch((err) => {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Puzzle image upload failed",
                );
              });
            }

            e.currentTarget.value = "";
          }}
        />

        <div className="surface mb-4 space-y-2 p-3 sm:p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 sm:w-24">
              Template
            </p>

            {/* Chips scroll sideways on narrow screens instead of wrapping into several rows */}
            <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 py-1">
              {editorTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tpl)}
                  aria-pressed={tpl.id === template.id}
                  className={`min-h-[44px] shrink-0 rounded-full px-4 text-sm font-semibold transition ${
                    tpl.id === template.id
                      ? "bg-pink-500 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 sm:w-24">
              Scene
            </p>

            <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 py-1">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => {
                    setActiveSceneIndex(index);
                    setSelectedId(null);
                    setError("");
                    setShowBookOptions(false);
                  }}
                  aria-pressed={index === activeSceneIndex}
                  className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                    index === activeSceneIndex
                      ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {scene.name}
                  {sceneTag(index) ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        index === activeSceneIndex
                          ? "bg-white/25 text-white"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {sceneTag(index)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid flex-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* On upright phones and tablets the canvas stays pinned under the top bar, so changes
              made with the tools below are visible as you make them. Zooming in releases it. */}
          <div className="surface min-w-0 p-3 max-lg:bg-white/95 max-lg:portrait:sticky max-lg:portrait:top-[4.5rem] max-lg:portrait:z-30 max-lg:portrait:has-[[data-zoomed=true]]:static sm:p-4">
            <LayoutEditor
              key={activeScene.id}
              items={items}
              background={activeScene.background}
              coverImage={activeScene.backgroundImage}
              animation={animation}
              book={activeScene.book}
              onBookFlip={handleBookFlip}
              onBookChange={updateActiveBook}
              onBookPageDoubleClick={(encodedSlotIndex) => {
                pendingBookSlotRef.current = encodedSlotIndex;
                bookMediaInputRef.current?.click();
              }}
              onChange={setActiveSceneItems}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onImageClick={(id) => {
                pendingImageIdRef.current = id;
                imageInputRef.current?.click();
              }}
              isGameScene={isGameScene}
              challengeTarget={activeScene.gameChallengeTarget ?? null}
              isPuzzleScene={isPuzzleScene}
              puzzleImage={activeScene.puzzleImage}
              puzzleTimeLimit={activeScene.puzzleTimeLimit ?? 60}
              backgroundPositionX={activeScene.backgroundPositionX ?? 50}
              backgroundPositionY={activeScene.backgroundPositionY ?? 50}
              onBackgroundPositionChange={(patch) => updateActiveScene(patch)}
            />
          </div>

          <aside className="surface space-y-4 p-4 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto">
            <h2 className="text-lg font-bold">Editor tools</h2>

            {isPuzzleScene ? (
              <>
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-medium leading-6 text-cyan-950">
                  Background 4 is reserved for the puzzle game. Upload one
                  image, and it will be split into 8 pieces for the player to
                  rebuild before the timer runs out.
                </div>

                <button
                  type="button"
                  onClick={() => puzzleImageInputRef.current?.click()}
                  className={toolButton}
                >
                  <ImagePlus className="h-4 w-4 shrink-0 text-violet-600" />
                  Upload puzzle image
                </button>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <label
                    htmlFor="puzzle-time-limit"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Puzzle time limit (seconds)
                  </label>

                  <input
                    id="puzzle-time-limit"
                    type="number"
                    inputMode="numeric"
                    min={30}
                    max={300}
                    step={10}
                    value={activeScene.puzzleTimeLimit ?? 60}
                    onChange={(e) =>
                      updateActiveScene({
                        puzzleTimeLimit: Math.max(
                          30,
                          Math.min(300, Number(e.target.value) || 60),
                        ),
                      })
                    }
                    className="field"
                  />
                </div>
              </>
            ) : isGameScene ? (
              <>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium leading-6 text-emerald-950">
                  Background 3 is reserved for the full-screen bird game. Text
                  boxes, image boxes, and albums are disabled for this scene.
                </div>

                <div className="space-y-3 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                  <label
                    htmlFor="challenge-target"
                    className="block text-base font-extrabold leading-6 text-slate-950"
                  >
                    Challenge: How many pipes can you pass?
                  </label>

                  <p className="text-sm font-medium leading-6 text-slate-600">
                    Enter a target number of pipes for the player to pass.
                  </p>

                  <input
                    id="challenge-target"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={activeScene.gameChallengeTarget ?? ""}
                    onChange={(e) =>
                      handleChallengeTargetChange(e.target.value)
                    }
                    placeholder="e.g. 30"
                    className="field"
                  />

                  <p className="text-sm leading-6 text-slate-500">
                    Example: If you enter 30, the mission is passed when the
                    score reaches 30.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => sceneBackgroundInputRef.current?.click()}
                  className={toolButton}
                >
                  <ImagePlus className="h-4 w-4 shrink-0 text-violet-600" />
                  Upload {activeScene.name.toLowerCase()} image
                </button>

                {animationSelector}
              </>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Add to scene
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={addTextBlock}
                      className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
                    >
                      <Type className="h-5 w-5 text-violet-600" />
                      Text
                    </button>

                    <button
                      type="button"
                      onClick={addEmojiBlock}
                      className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
                    >
                      <Smile className="h-5 w-5 text-violet-600" />
                      Emoji
                    </button>

                    <button
                      type="button"
                      onClick={addEmptyImageBlock}
                      className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
                    >
                      <ImagePlus className="h-5 w-5 text-violet-600" />
                      Image box
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Items in this scene
                  </p>

                  {items.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          aria-pressed={item.id === selectedId}
                          className={`flex min-h-[44px] max-w-full items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition ${
                            item.id === selectedId
                              ? "border-pink-400 bg-pink-50 text-pink-700"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {item.type === "text" ? (
                            <Type className="h-4 w-4 shrink-0" />
                          ) : (
                            <ImageIcon className="h-4 w-4 shrink-0" />
                          )}
                          <span className="truncate">{itemLabel(item)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-slate-500">
                      Nothing here yet. Add text, an emoji, or an image box.
                    </p>
                  )}
                </div>

                {selected ? (
                  <div className="grid gap-3 rounded-2xl border border-pink-200 bg-pink-50/70 p-4">
                    <p className="text-sm font-bold text-slate-900">
                      {selected.type === "text"
                        ? "Selected text block"
                        : "Selected image box"}
                    </p>

                    {selected.type === "text" ? (
                      <>
                        <textarea
                          aria-label="Text"
                          value={selected.content ?? ""}
                          onChange={(e) =>
                            updateItem(selected.id, { content: e.target.value })
                          }
                          className="field min-h-24"
                        />

                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          Font size
                          <input
                            type="range"
                            min={16}
                            max={72}
                            value={selected.fontSize ?? 24}
                            onChange={(e) =>
                              updateItem(selected.id, {
                                fontSize: Number(e.target.value),
                              })
                            }
                            className="h-8 w-full accent-violet-600"
                          />
                        </label>

                        <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                          Color
                          <input
                            type="color"
                            value={selected.color ?? "#ffffff"}
                            onChange={(e) =>
                              updateItem(selected.id, { color: e.target.value })
                            }
                            className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          Weight
                          <input
                            type="range"
                            min={300}
                            max={900}
                            step={100}
                            value={selected.fontWeight ?? 700}
                            onChange={(e) =>
                              updateItem(selected.id, {
                                fontWeight: Number(e.target.value),
                              })
                            }
                            className="h-8 w-full accent-violet-600"
                          />
                        </label>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          pendingImageIdRef.current = selected.id;
                          imageInputRef.current?.click();
                        }}
                        className={toolButton}
                      >
                        <ImagePlus className="h-4 w-4 shrink-0 text-violet-600" />
                        {selected.src ? "Replace photo" : "Upload photo"}
                      </button>
                    )}

                    {/* Sliders do what dragging does, for when the canvas is too small to drag precisely */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-pink-200 pt-3">
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        Left / right
                        <input
                          type="range"
                          min={0}
                          max={Math.max(DESIGN_WIDTH - selected.w, selected.x)}
                          value={Math.round(selected.x)}
                          onChange={(e) =>
                            updateItem(selected.id, { x: Number(e.target.value) })
                          }
                          className="h-8 w-full accent-violet-600"
                        />
                      </label>

                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        Up / down
                        <input
                          type="range"
                          min={0}
                          max={Math.max(STAGE_HEIGHT - selected.h, selected.y)}
                          value={Math.round(selected.y)}
                          onChange={(e) =>
                            updateItem(selected.id, { y: Number(e.target.value) })
                          }
                          className="h-8 w-full accent-violet-600"
                        />
                      </label>

                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        Width
                        <input
                          type="range"
                          min={Math.min(120, selected.w)}
                          max={Math.max(DESIGN_WIDTH - selected.x, selected.w)}
                          value={Math.round(selected.w)}
                          onChange={(e) =>
                            updateItem(selected.id, { w: Number(e.target.value) })
                          }
                          className="h-8 w-full accent-violet-600"
                        />
                      </label>

                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        Height
                        <input
                          type="range"
                          min={Math.min(60, selected.h)}
                          max={Math.max(STAGE_HEIGHT - selected.y, selected.h)}
                          value={Math.round(selected.h)}
                          onChange={(e) =>
                            updateItem(selected.id, { h: Number(e.target.value) })
                          }
                          className="h-8 w-full accent-violet-600"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={deleteSelected}
                      className="flex min-h-[44px] w-full items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-left text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      Delete selected item
                    </button>
                  </div>
                ) : items.length > 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-sm leading-6 text-slate-500">
                    Tap an item above, or on the canvas, to edit, move, or delete it.
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => sceneBackgroundInputRef.current?.click()}
                  className={toolButton}
                >
                  <ImagePlus className="h-4 w-4 shrink-0 text-violet-600" />
                  Upload {activeScene.name.toLowerCase()} image
                </button>

                {animationSelector}

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      Album title
                    </span>
                    <input
                      value={bookTitleInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBookTitleInput(value);
                        if (activeScene.book) {
                          updateActiveBook({ title: value });
                        }
                      }}
                      className="field"
                      placeholder="Our Album"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowBookOptions((prev) => !prev)}
                    aria-expanded={showBookOptions}
                    className={toolButton}
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-violet-600" />
                    {activeScene.book?.enabled
                      ? "Edit album"
                      : `+ Add album to ${activeScene.name}`}
                  </button>

                  {showBookOptions ? (
                    <div className="grid gap-2">
                      {activeScene.book?.enabled ? (
                        <p className="text-xs leading-5 text-slate-500">
                          Picking a size starts a new, empty album.
                        </p>
                      ) : null}

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => createBook(4)}
                          className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
                        >
                          4 pages
                        </button>
                        <button
                          type="button"
                          onClick={() => createBook(6)}
                          className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
                        >
                          6 pages
                        </button>
                        <button
                          type="button"
                          onClick={() => createBook(8)}
                          className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
                        >
                          8 pages
                        </button>
                      </div>

                      {activeScene.book?.enabled ? (
                        <button
                          type="button"
                          onClick={removeBook}
                          className="min-h-[44px] w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Remove album from this background
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {activeScene.book?.enabled ? (
                    <div className="grid gap-3 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => bookCoverInputRef.current?.click()}
                        className={toolButton}
                      >
                        <ImagePlus className="h-4 w-4 shrink-0 text-violet-600" />
                        Upload album cover image
                      </button>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Cover image horizontal position
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={activeScene.book?.coverPositionX ?? 50}
                          onChange={(e) =>
                            updateActiveBook({
                              coverPositionX: Number(e.target.value),
                            })
                          }
                          className="h-8 w-full accent-violet-600"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Cover image vertical position
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={activeScene.book?.coverPositionY ?? 50}
                          onChange={(e) =>
                            updateActiveBook({
                              coverPositionY: Number(e.target.value),
                            })
                          }
                          className="h-8 w-full accent-violet-600"
                        />
                      </label>
                    </div>
                  ) : null}

                  <p className="text-xs leading-5 text-slate-500">
                    Album pages support 1 to 4 photos. Double-click, or tap
                    twice, any photo box inside the album to upload.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      {/* Upload progress and errors float above the page so they are seen wherever you have scrolled to */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[150] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {uploads > 0 ? (
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        ) : null}

        {error && !showDetailsModal ? (
          <div
            role="alert"
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-rose-200 bg-white p-4 text-sm font-semibold text-rose-700 shadow-xl"
          >
            <p className="min-w-0 flex-1 break-words leading-6">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss"
              className="-m-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {showDetailsModal ? (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={closeDetailsModal}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveDetails();
            }}
            className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-[1.75rem] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[2rem] sm:p-7"
          >
            <p className="eyebrow text-pink-600">Customize URL</p>
            <h3
              id="details-title"
              className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl"
            >
              Create a beautiful share link
            </h3>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="field-label">Recipient name</span>
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="field"
                  placeholder="Recipient name"
                />
              </label>

              <label className="grid gap-2">
                <span className="field-label">Occasion</span>
                <input
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="field"
                  placeholder="Birthday, Valentine, Anniversary..."
                />
              </label>

              <label className="grid gap-2">
                <span className="field-label">From name</span>
                <input
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="field"
                  placeholder="From name"
                />
              </label>

              <label className="grid gap-2">
                <span className="field-label">
                  Custom keyword{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </span>
                <input
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                  className="field"
                  placeholder="Optional custom keyword"
                />
              </label>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                  URL preview
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-emerald-900">
                  /{urlPreview || "your-custom-link"}
                </p>
              </div>

              {error ? (
                <p role="alert" className="notice notice-error">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDetailsModal}
                className="btn btn-secondary"
              >
                Close
              </button>

              <button type="submit" className="btn btn-primary">
                Save Details
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {shareUrl ? (
        <div
          className="fixed inset-0 z-[220] flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-4"
        >
          {/* No close-on-outside-tap here: this dialog is the only place the new link is shown */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-[1.75rem] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[2rem] sm:p-7"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-6 w-6" />
            </div>

            <p className="eyebrow mt-4 text-center text-emerald-700">
              Ready to share
            </p>

            <h3
              id="share-title"
              className="mt-2 text-center text-2xl font-extrabold text-slate-900 sm:text-3xl"
            >
              Your URL is ready
            </h3>

            <div className="mt-5 break-all rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-900">
              {shareUrl}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={copyUrl}
                className="btn bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy URL"}
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink className="h-4 w-4" />
                Open page
              </a>

              <button
                type="button"
                onClick={() => setShareUrl("")}
                className="btn btn-secondary"
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
