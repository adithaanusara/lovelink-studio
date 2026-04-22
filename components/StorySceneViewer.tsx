"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MemoryBook, BookPageMedia } from "@/components/MemoryBook";
import { FlappyBirdScene } from "@/components/FlappyBirdScene";

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
};

type StorySceneItem = {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  w: number;
  h: number;
  content?: string;
  src?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  z?: number;
};

type StoryScene = {
  id: string;
  name: string;
  background: string;
  backgroundImage?: string;
  items: StorySceneItem[];
  book?: BookData;

  // add this new one
  gameChallengeTarget?: number | null;
};

function FallingLayer({ type }: { type: AnimationType }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        delay: `${(i % 12) * 0.25}s`,
        duration: `${4.2 + (i % 5) * 0.55}s`,
        size: 14 + (i % 6) * 5,
        drift: -40 + (i % 9) * 10,
        rotate: 90 + (i % 8) * 35,
        opacity: 0.35 + (i % 4) * 0.12,
        symbol: type === "falling-petals" ? "✿" : "♥"
      })),
    [type]
  );

  if (type !== "falling-hearts" && type !== "falling-petals") return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes romantic-fall-public-dense {
          0% {
            transform: translate3d(0, -14vh, 0) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
          100% {
            transform: translate3d(var(--drift), 118vh, 0) rotate(var(--rotate)) scale(1.08);
            opacity: 0;
          }
        }
      `}</style>

      {particles.map((item) => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: "-16%",
            fontSize: `${item.size}px`,
            color: type === "falling-petals" ? "#f9a8d4" : "#fb7185",
            opacity: item.opacity,
            animationName: "romantic-fall-public-dense",
            animationDuration: item.duration,
            animationDelay: item.delay,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            filter:
              type === "falling-petals"
                ? "drop-shadow(0 0 10px rgba(249,168,212,0.35))"
                : "drop-shadow(0 0 10px rgba(251,113,133,0.35))",
            ["--drift" as string]: `${item.drift}px`,
            ["--rotate" as string]: `${item.rotate}deg`
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

function SparkleHeartsLayer() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${3 + ((i * 11) % 94)}%`,
        top: `${4 + ((i * 9) % 88)}%`,
        delay: `${(i % 8) * 0.18}s`,
        size: 10 + (i % 5) * 5
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes sparkle-heart-public-dense {
          0%, 100% {
            transform: scale(0.7);
            opacity: 0.12;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }
      `}</style>

      {hearts.map((item) => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: item.top,
            fontSize: `${item.size}px`,
            color: "#fb7185",
            animationName: "sparkle-heart-public-dense",
            animationDuration: "1.5s",
            animationDelay: item.delay,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
            filter: "drop-shadow(0 0 12px rgba(251,113,133,0.5))"
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

export function StorySceneViewer({
  scenes,
  animation
}: {
  scenes: StoryScene[];
  animation: AnimationType;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [sceneBookPages, setSceneBookPages] = useState<Record<string, number>>({});

  const scene = scenes[activeIndex] ?? scenes[0];

  useEffect(() => {
    if (!scenes.length) return;

    setSceneBookPages((prev) => {
      const next = { ...prev };

      scenes.forEach((currentScene) => {
        if (!currentScene.book?.enabled) return;

        if (typeof next[currentScene.id] !== "number") {
          next[currentScene.id] =
            typeof currentScene.book.currentPage === "number"
              ? currentScene.book.currentPage
              : -1;
        }
      });

      return next;
    });
  }, [scenes]);

  const handleBookPageChange = (sceneId: string, page: number) => {
    setSceneBookPages((prev) => ({
      ...prev,
      [sceneId]: page
    }));
  };

  if (!scene) return null;

  const goToScene = (nextIndex: number) => {
    if (nextIndex === activeIndex || nextIndex < 0 || nextIndex >= scenes.length) return;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex(nextIndex);
  };

  const normalizedName = (scene.name || "").trim().toLowerCase();

  const isGameScene =
    activeIndex === 2 ||
    normalizedName === "background 3" ||
    normalizedName === "scene 3";

  const currentBookPage =
    scene.book?.enabled && typeof sceneBookPages[scene.id] === "number"
      ? sceneBookPages[scene.id]
      : scene.book?.currentPage ?? -1;

  return (
    <section
      className="relative mx-auto min-h-screen max-w-[1400px] overflow-hidden"
      style={{ background: scene.background }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={scene.id}
          custom={direction}
          initial={{
            opacity: 0,
            x: direction > 0 ? 120 : -120,
            scale: 1.03,
            filter: "blur(10px)"
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)"
          }}
          exit={{
            opacity: 0,
            x: direction > 0 ? -120 : 120,
            scale: 0.985,
            filter: "blur(10px)"
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute inset-0"
        >
          <div
            className="relative h-full min-h-screen w-full"
            style={{ background: scene.background }}
          >
            {isGameScene ? (
              <FlappyBirdScene

                // add this new one
                challengeTarget={scene.gameChallengeTarget ?? null}
              />
            ) : (
              <>
                {scene.backgroundImage ? (
                  <>
                    <motion.img
                      src={scene.backgroundImage}
                      alt={`${scene.name} background`}
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ scale: 1.08, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.96, opacity: 0.65 }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="absolute inset-0 bg-slate-950/45" />
                  </>
                ) : null}

                {animation === "falling-hearts" ? <FallingLayer type="falling-hearts" /> : null}
                {animation === "falling-petals" ? <FallingLayer type="falling-petals" /> : null}
                {animation === "sparkle-hearts" ? <SparkleHeartsLayer /> : null}

                {scene.book?.enabled ? (
                  <motion.div
                    className="absolute z-[70]"
                    style={{
                      left: scene.book.x,
                      top: scene.book.y,
                      width: scene.book.w
                    }}
                    initial={{ opacity: 0, y: 28, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -18, scale: 0.96 }}
                    transition={{ duration: 0.65, delay: 0.12 }}
                  >
                    <MemoryBook
                      pageCount={scene.book.pageCount}
                      pages={scene.book.pages}
                      currentPage={currentBookPage}
                      onCurrentPageChange={(page) => handleBookPageChange(scene.id, page)}
                      width={scene.book.w}
                      height={scene.book.h}
                      coverImage={scene.backgroundImage}
                      title={scene.book.title || `${scene.name} Memory Book`}
                    />
                  </motion.div>
                ) : null}

                <div className="absolute inset-0 bg-black/10" />

                {scene.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="absolute"
                    style={{
                      left: item.x,
                      top: item.y,
                      width: item.w,
                      height: item.h,
                      zIndex: item.z ?? 1
                    }}
                    initial={{
                      opacity: 0,
                      y: 26,
                      scale: 0.97
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      scale: 0.97
                    }}
                    transition={{
                      duration: 0.45,
                      delay: 0.12 + index * 0.05
                    }}
                  >
                    {item.type === "text" ? (
                      <div
                        className="whitespace-pre-wrap"
                        style={{
                          color: item.color || "#fff",
                          fontSize: item.fontSize || 24,
                          fontWeight: item.fontWeight || 700,
                          textShadow: "0 6px 30px rgba(0,0,0,0.35)"
                        }}
                      >
                        {item.content}
                      </div>
                    ) : item.src ? (
                      <img
                        src={item.src}
                        alt="Story memory"
                        className="h-full w-full rounded-[1.75rem] object-cover shadow-2xl"
                      />
                    ) : null}
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute left-1/2 top-6 z-[95] flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-md">
        {scenes.map((currentScene, index) => (
          <button
            key={currentScene.id}
            type="button"
            onClick={() => goToScene(index)}
            className={`h-3 w-3 rounded-full transition ${
              index === activeIndex ? "bg-pink-400" : "bg-white/30"
            }`}
            aria-label={`Open ${currentScene.name}`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-8 z-[95] flex gap-3">
        {activeIndex > 0 ? (
          <button
            type="button"
            onClick={() => goToScene(activeIndex - 1)}
            className="rounded-full border border-white/20 bg-black/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-black/45"
          >
            Previous
          </button>
        ) : null}

        {activeIndex < scenes.length - 1 ? (
          <button
            type="button"
            onClick={() => goToScene(activeIndex + 1)}
            className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-xl transition hover:scale-[1.02]"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goToScene(0)}
            className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-xl transition hover:scale-[1.02]"
          >
            Back to Start
          </button>
        )}
      </div>
    </section>
  );
}