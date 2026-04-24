"use client";

import { useMemo, useRef, useState } from "react";
import { editorTemplates, EditorItem, EditorTemplate } from "@/lib/templates";
import { LayoutEditor } from "@/components/LayoutEditor";
import { BookPageMedia } from "@/components/MemoryBook";

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

  if (!response.ok) {
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
          () => null
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

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const sceneBackgroundInputRef = useRef<HTMLInputElement | null>(null);
  const pendingImageIdRef = useRef<string | null>(null);

  const bookMediaInputRef = useRef<HTMLInputElement | null>(null);
  const bookCoverInputRef = useRef<HTMLInputElement | null>(null);
  const pendingBookSlotRef = useRef<number | null>(null);
  const puzzleImageInputRef = useRef<HTMLInputElement | null>(null);

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
    const result = await uploadMedia(file);

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

    const result = await uploadMedia(file);
    if (result.resourceType !== "image") {
      setError("Only images can be added to normal image boxes.");
      return;
    }

    updateItem(imageId, { src: result.url });
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

    const result = await uploadMedia(file);
    if (!activeScene.book) return;

    const pageIndex = Math.floor(encodedSlotIndex / 10);
    const slotIndex = encodedSlotIndex % 10;

    if (!activeScene.book.pages[pageIndex]) return;

    const nextPages = [...activeScene.book.pages];
    const targetPage = nextPages[pageIndex];

    nextPages[pageIndex] = {
      ...targetPage,
      slots: targetPage.slots.map((slot, index) =>
        index === slotIndex
          ? {
              type: result.resourceType === "video" ? "video" : "image",
              url: result.url,
              poster: result.poster,
            }
          : slot
      ),
    };

    updateActiveBook({ pages: nextPages });
    setError("");
  };

  const handleBookCoverUpload = async (file: File) => {
    if (isGameScene || isPuzzleScene) return;

    const result = await uploadMedia(file);
    if (result.resourceType !== "image") {
      setError("Only images can be used as the album cover.");
      return;
    }

    if (!activeScene.book) return;

    updateActiveBook({
      coverImage: result.url,
      coverPositionX: 50,
      coverPositionY: 50,
    });
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
    const result = await uploadMedia(file);

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
                    .filter((slot): slot is NonNullable<typeof slot> => Boolean(slot?.url))
                    .map((slot, slotIndex) => ({
                      imageUrl: slot.url,
                      altText: `${scene.name}-album-page-${pageIndex + 1}-slot-${slotIndex + 1}`,
                    }))
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
    <main className="min-h-screen bg-sky-100 text-slate-900">
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

        <div className="mb-4 rounded-[1.5rem] border border-sky-300/80 bg-sky-100/90 p-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            {editorTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleTemplateSelect(tpl)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  tpl.id === template.id
                    ? "bg-pink-500 text-white"
                    : "bg-sky-100 text-slate-700 hover:bg-sky-200"
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
                className="rounded-full bg-sky-100 px-5 py-3 text-sm font-semibold text-slate-700"
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

        <div className="mb-4 flex flex-wrap gap-3 rounded-[1.5rem] border border-sky-300/80 bg-sky-100/90 p-3">
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
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                index === activeSceneIndex
                  ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white"
                  : "bg-sky-100 text-slate-700 hover:bg-sky-200"
              }`}
            >
              {scene.name}
            </button>
          ))}
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-[1.75rem] border border-sky-300/80 bg-sky-100/90 p-4">
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

          <div className="space-y-4 rounded-[1.75rem] border border-sky-300/80 bg-sky-100/90 p-4">
            <h2 className="text-lg font-bold">Editor tools</h2>

            {isPuzzleScene ? (
              <>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                  Background 4 is reserved for the puzzle game. Upload one
                  image, and it will be split into 8 pieces. The player has 1
                  minute to rebuild it.
                </div>

                <button
                  type="button"
                  onClick={() => puzzleImageInputRef.current?.click()}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-4 text-left text-sm font-medium text-slate-700 transition hover:from-cyan-200 hover:to-blue-200"
                >
                  Upload puzzle image
                </button>

                <div className="rounded-2xl border border-sky-300/80 bg-sky-100/95 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Puzzle time limit (seconds)
                  </label>

                  <input
                    type="number"
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
                    className="w-full rounded-xl border border-sky-300 bg-sky-100 px-3 py-3 text-sm text-slate-800 outline-none"
                  />
                </div>
              </>
            ) : isGameScene ? (
              <>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  Background 3 is reserved for the full-screen bird game. Text
                  boxes, image boxes, and albums are disabled for this scene.
                </div>

                <div className="space-y-3 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
                  <h3 className="text-base font-bold text-yellow-100">
                    Challenge: How many pipes can you pass?
                  </h3>

                  <p className="text-sm text-yellow-50/90">
                    Enter a target number of pipes for the player to pass.
                  </p>

                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={activeScene.gameChallengeTarget ?? ""}
                    onChange={(e) =>
                      handleChallengeTargetChange(e.target.value)
                    }
                    placeholder="e.g. 30"
                    className="w-full rounded-xl border border-sky-300 bg-sky-100 px-3 py-3 text-sm text-slate-800 outline-none"
                  />

                  <p className="text-xs text-yellow-50/75">
                    Example: If you enter 30, the mission is passed when the
                    score reaches 30.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => sceneBackgroundInputRef.current?.click()}
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-100 to-violet-100 px-4 py-4 text-left text-sm font-medium text-slate-700 transition hover:from-pink-200 hover:to-violet-200"
                >
                  Upload {activeScene.name.toLowerCase()} image
                </button>

                <div className="rounded-2xl border border-sky-300/80 bg-sky-100/95 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Animation selector
                  </label>
                  <select
                    value={animation}
                    onChange={(e) =>
                      setAnimation(e.target.value as AnimationType)
                    }
                    className="w-full rounded-2xl border border-sky-300 bg-sky-100 p-3 text-slate-800 outline-none"
                  >
                    <option value="none">No animation</option>
                    <option value="falling-hearts">Falling hearts</option>
                    <option value="falling-petals">Falling petals</option>
                    <option value="sparkle-hearts">Sparkle hearts</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={addTextBlock}
                    className="w-full rounded-2xl bg-sky-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-200"
                  >
                    + Add text
                  </button>

                  <button
                    type="button"
                    onClick={addEmojiBlock}
                    className="w-full rounded-2xl bg-sky-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-200"
                  >
                    + Add emoji
                  </button>

                  <button
                    type="button"
                    onClick={addEmptyImageBlock}
                    className="w-full rounded-2xl bg-sky-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-200"
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
                    onClick={() => sceneBackgroundInputRef.current?.click()}
                    className="w-full rounded-2xl bg-gradient-to-r from-pink-100 to-violet-100 px-4 py-4 text-left text-sm font-medium text-slate-700 transition hover:from-pink-200 hover:to-violet-200"
                  >
                    Upload {activeScene.name.toLowerCase()} image
                  </button>
                </div>

                <div className="rounded-2xl border border-sky-300/80 bg-sky-100/95 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Animation selector
                  </label>
                  <select
                    value={animation}
                    onChange={(e) =>
                      setAnimation(e.target.value as AnimationType)
                    }
                    className="w-full rounded-2xl border border-sky-300 bg-sky-100 p-3 text-slate-800 outline-none"
                  >
                    <option value="none">No animation</option>
                    <option value="falling-hearts">Falling hearts</option>
                    <option value="falling-petals">Falling petals</option>
                    <option value="sparkle-hearts">Sparkle hearts</option>
                  </select>
                </div>

                <div className="space-y-3 rounded-2xl border border-sky-300/80 bg-sky-100/95 p-4">
                  <div className="rounded-2xl border border-sky-300/80 bg-sky-100 p-3">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Album title
                    </label>
                    <input
                      value={bookTitleInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBookTitleInput(value);
                        if (activeScene.book) {
                          updateActiveBook({ title: value });
                        }
                      }}
                      className="w-full rounded-xl border border-sky-300 bg-sky-100/95 px-3 py-3 text-sm text-slate-800 outline-none"
                      placeholder="Our Album"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBookOptions((prev) => !prev)}
                    className="w-full rounded-2xl bg-sky-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-200"
                  >
                    {activeScene.book?.enabled
                      ? "Edit album"
                      : `+ Add album to ${activeScene.name}`}
                  </button>

                  {showBookOptions ? (
                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => createBook(4)}
                        className="w-full rounded-xl bg-sky-100 px-4 py-3 text-left text-sm text-slate-700"
                      >
                        4 pages
                      </button>
                      <button
                        type="button"
                        onClick={() => createBook(6)}
                        className="w-full rounded-xl bg-sky-100 px-4 py-3 text-left text-sm text-slate-700"
                      >
                        6 pages
                      </button>
                      <button
                        type="button"
                        onClick={() => createBook(8)}
                        className="w-full rounded-xl bg-sky-100 px-4 py-3 text-left text-sm text-slate-700"
                      >
                        8 pages
                      </button>

                      {activeScene.book?.enabled ? (
                        <button
                          type="button"
                          onClick={removeBook}
                          className="w-full rounded-xl bg-red-500/20 px-4 py-3 text-left text-sm text-red-200"
                        >
                          Remove album from this background
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="grid gap-3 rounded-2xl border border-sky-300/80 bg-sky-100 p-4">
                    <button
                      type="button"
                      onClick={() => bookCoverInputRef.current?.click()}
                      className="w-full rounded-xl bg-sky-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-200"
                    >
                      Upload album cover image
                    </button>

                    <label className="grid gap-2 text-sm text-slate-700">
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
                      />
                    </label>

                    <label className="grid gap-2 text-sm text-slate-700">
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
                      />
                    </label>

                    <p className="text-xs leading-6 text-slate-600">
                      Album pages support 1 to 4 photos. Double click any photo
                      box inside the album to upload.
                    </p>
                  </div>
                </div>

                {selected?.type === "text" ? (
                  <div className="grid gap-3 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4">
                    <p className="font-semibold">Selected text block</p>

                    <textarea
                      value={selected.content ?? ""}
                      onChange={(e) =>
                        updateItem(selected.id, { content: e.target.value })
                      }
                      className="min-h-24 w-full rounded-2xl border border-sky-300 bg-sky-100/95 p-3 text-slate-800"
                    />

                    <label className="grid gap-2 text-sm text-slate-700">
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
                      />
                    </label>

                    <label className="grid gap-2 text-sm text-slate-700">
                      Color
                      <input
                        type="color"
                        value={selected.color ?? "#ffffff"}
                        onChange={(e) =>
                          updateItem(selected.id, { color: e.target.value })
                        }
                      />
                    </label>

                    <label className="grid gap-2 text-sm text-slate-700">
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
                      />
                    </label>
                  </div>
                ) : null}
              </>
            )}

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showDetailsModal ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-sky-300/80 bg-sky-100/95 p-6 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-pink-500">
              Customize URL
            </p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              Create a beautiful share link
            </h3>

            <div className="mt-6 grid gap-4">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full rounded-2xl border border-sky-300 bg-sky-100 p-4 text-slate-800"
                placeholder="Recipient name"
              />

              <input
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full rounded-2xl border border-sky-300 bg-sky-100 p-4 text-slate-800"
                placeholder="Occasion (Birthday, Valentine, Anniversary...)"
              />

              <input
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full rounded-2xl border border-sky-300 bg-sky-100 p-4 text-slate-800"
                placeholder="From name"
              />

              <input
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                className="w-full rounded-2xl border border-sky-300 bg-sky-100 p-4 text-slate-800"
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
                className="rounded-full bg-sky-200 px-5 py-3 text-sm font-semibold text-slate-700"
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
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-sky-300/70 bg-sky-100/95 p-6 shadow-2xl">
            <p className="text-center text-sm uppercase tracking-[0.3em] text-emerald-200">
              Ready to share
            </p>

            <h3 className="mt-3 text-center text-3xl font-bold text-slate-900">
              Your URL is ready
            </h3>

            <div className="mt-6 break-all rounded-2xl border border-sky-300/80 bg-sky-100 p-4 text-center text-sm text-emerald-700">
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
                className="rounded-full bg-sky-100 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Open page
              </a>

              <button
                type="button"
                onClick={() => setShareUrl("")}
                className="rounded-full bg-sky-100 px-5 py-3 text-sm font-semibold text-slate-700"
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