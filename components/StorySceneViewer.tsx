"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MemoryBook, BookPageMedia } from "@/components/MemoryBook";
import { FlappyBirdScene } from "@/components/FlappyBirdScene";
import { PuzzleGameScene } from "@/components/PuzzleGameScene";

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
  imagePositionX?: number;
  imagePositionY?: number;
};

type StoryScene = {
  id: string;
  name: string;
  background: string;
  backgroundImage?: string;
  items: StorySceneItem[];
  book?: BookData;
  gameChallengeTarget?: number | null;
  puzzleImage?: string;
  puzzleTimeLimit?: number;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
};

function Romantic3DStyles() {
  return (
    <style>{`
      .romantic-3d-layer {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 5;
        perspective: 1800px;
      }

      .romantic-falling-particle,
      .romantic-sparkle-particle {
        position: absolute;
        transform-style: preserve-3d;
        will-change: transform, opacity, filter;
      }

      .romantic-falling-particle {
        top: -22%;
      }

      .romantic-object-3d {
        position: relative;
        transform-style: preserve-3d;
        transform-origin: center center;
      }

      .romantic-heart-wrap {
        filter:
          drop-shadow(0 18px 28px rgba(236, 72, 153, 0.28))
          drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18));
        transform: rotateX(-22deg) rotateY(-34deg);
      }

      .romantic-flower-wrap {
        filter:
          drop-shadow(0 16px 26px rgba(244, 114, 182, 0.22))
          drop-shadow(0 6px 10px rgba(0, 0, 0, 0.16));
        transform: rotateX(-18deg) rotateY(-28deg);
      }

      .romantic-heart-svg,
      .romantic-flower-svg,
      .romantic-star-svg {
        display: block;
        overflow: visible;
      }

      @keyframes romantic-fall-3d {
        0% {
          transform:
            translate3d(0, -20vh, 0)
            rotateX(0deg)
            rotateY(0deg)
            rotateZ(var(--rz0))
            scale(var(--s));
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        55% {
          opacity: 1;
        }
        100% {
          transform:
            translate3d(var(--dx), 122vh, 0)
            rotateX(var(--rx))
            rotateY(var(--ry))
            rotateZ(var(--rz1))
            scale(calc(var(--s) * 1.1));
          opacity: 0;
        }
      }

      @keyframes romantic-sway-3d {
        0%, 100% {
          margin-left: -10px;
        }
        50% {
          margin-left: 12px;
        }
      }

      @keyframes romantic-shimmer-3d {
        0%, 100% {
          filter: brightness(1) saturate(1);
        }
        50% {
          filter: brightness(1.18) saturate(1.15);
        }
      }

      @keyframes romantic-sparkle-float {
        0%, 100% {
          transform:
            translate3d(0, 0, 0)
            rotateX(0deg)
            rotateY(0deg)
            rotateZ(var(--r))
            scale(var(--s));
          opacity: 0.4;
        }
        50% {
          transform:
            translate3d(0, -16px, 0)
            rotateX(18deg)
            rotateY(22deg)
            rotateZ(calc(var(--r) + 20deg))
            scale(calc(var(--s) * 1.25));
          opacity: 1;
        }
      }

      @keyframes romantic-sparkle-glow {
        0%, 100% {
          filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0));
        }
        50% {
          filter: brightness(1.35) drop-shadow(0 0 16px rgba(255,255,255,0.55));
        }
      }

      @keyframes romantic-twinkle {
        0%, 100% {
          opacity: 0.35;
          transform: scale(0.9) rotate(var(--r));
        }
        50% {
          opacity: 1;
          transform: scale(1.35) rotate(calc(var(--r) + 18deg));
        }
      }
    `}</style>
  );
}

function Heart3D({ size }: { size: number }) {
  const uid = useId().replace(/:/g, "");
  const depth = Math.max(8, Math.round(size * 0.12));

  const frontGrad = `heart-front-${uid}`;
  const shadowGrad = `heart-shadow-${uid}`;
  const sideGrad = `heart-side-${uid}`;
  const glossGrad = `heart-gloss-${uid}`;

  const heartPath =
    "M80 144 C66 134 21 104 12 64 C6 38 24 16 50 16 C65 16 75 24 80 37 C85 24 95 16 110 16 C136 16 154 38 148 64 C139 104 94 134 80 144 Z";

  return (
    <div
      className="romantic-object-3d romantic-heart-wrap"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 170 170"
        className="romantic-heart-svg"
        width={size}
        height={size}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={frontGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd8e8" />
            <stop offset="18%" stopColor="#ffb8d4" />
            <stop offset="42%" stopColor="#ff83b6" />
            <stop offset="72%" stopColor="#ee4f90" />
            <stop offset="100%" stopColor="#c81f67" />
          </linearGradient>

          <linearGradient id={sideGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9d123f" />
            <stop offset="45%" stopColor="#7a0e31" />
            <stop offset="100%" stopColor="#50051e" />
          </linearGradient>

          <radialGradient id={shadowGrad} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.32)" />
          </radialGradient>

          <linearGradient id={glossGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <path
          d={heartPath}
          transform={`translate(${depth}, ${depth * 0.8})`}
          fill={`url(#${sideGrad})`}
          opacity="0.95"
        />

        <path d={heartPath} fill={`url(#${frontGrad})`} />
        <path d={heartPath} fill={`url(#${shadowGrad})`} opacity="0.45" />

        <ellipse
          cx="56"
          cy="40"
          rx="22"
          ry="10"
          fill="white"
          opacity="0.72"
          transform="rotate(-22 56 40)"
        />
        <ellipse
          cx="102"
          cy="48"
          rx="18"
          ry="8"
          fill="white"
          opacity="0.42"
          transform="rotate(-18 102 48)"
        />

        <path
          d="M34 42 C48 20, 86 14, 112 24 C95 24, 76 29, 58 42 C49 49, 40 48, 34 42 Z"
          fill={`url(#${glossGrad})`}
          opacity="0.9"
        />

        <ellipse
          cx="80"
          cy="92"
          rx="36"
          ry="22"
          fill="white"
          opacity="0.1"
          transform="rotate(-20 80 92)"
        />
      </svg>
    </div>
  );
}

function Flower3D({ size }: { size: number }) {
  const uid = useId().replace(/:/g, "");
  const depth = Math.max(8, Math.round(size * 0.1));
  const petalCount = 12;

  const petalFront = `flower-front-${uid}`;
  const petalSide = `flower-side-${uid}`;
  const centerFront = `flower-center-front-${uid}`;
  const centerSide = `flower-center-side-${uid}`;

  return (
    <div
      className="romantic-object-3d romantic-flower-wrap"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 170 170"
        className="romantic-flower-svg"
        width={size}
        height={size}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={petalFront} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe3f0" />
            <stop offset="28%" stopColor="#ffc3dc" />
            <stop offset="65%" stopColor="#f68aba" />
            <stop offset="100%" stopColor="#db4a90" />
          </linearGradient>

          <linearGradient id={petalSide} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a72b69" />
            <stop offset="60%" stopColor="#7f174f" />
            <stop offset="100%" stopColor="#580a34" />
          </linearGradient>

          <radialGradient id={centerFront} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff0f7" />
            <stop offset="35%" stopColor="#ffc6e1" />
            <stop offset="100%" stopColor="#ef5ca3" />
          </radialGradient>

          <radialGradient id={centerSide} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e87ab3" />
            <stop offset="100%" stopColor="#9d1f63" />
          </radialGradient>
        </defs>

        <g transform={`translate(${depth}, ${depth * 0.75})`} opacity="0.96">
          {Array.from({ length: petalCount }).map((_, i) => (
            <ellipse
              key={`b-${i}`}
              cx="85"
              cy="46"
              rx="18"
              ry="38"
              fill={`url(#${petalSide})`}
              transform={`rotate(${i * (360 / petalCount)} 85 85)`}
            />
          ))}
          <circle cx="85" cy="85" r="24" fill={`url(#${centerSide})`} />
        </g>

        {Array.from({ length: petalCount }).map((_, i) => (
          <ellipse
            key={`f-${i}`}
            cx="85"
            cy="46"
            rx="18"
            ry="38"
            fill={`url(#${petalFront})`}
            transform={`rotate(${i * (360 / petalCount)} 85 85)`}
          />
        ))}

        <circle cx="85" cy="85" r="24" fill={`url(#${centerFront})`} />

        <ellipse
          cx="76"
          cy="75"
          rx="10"
          ry="6"
          fill="white"
          opacity="0.6"
          transform="rotate(-22 76 75)"
        />
      </svg>
    </div>
  );
}

function SparkleStar({
  size,
  color = "#ffffff",
}: {
  size: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="romantic-star-svg"
      aria-hidden="true"
    >
      <g filter="drop-shadow(0 0 10px rgba(255,255,255,0.55))">
        <path
          d="M50 6 L58 38 L94 50 L58 62 L50 94 L42 62 L6 50 L42 38 Z"
          fill={color}
          opacity="0.95"
        />
        <circle cx="50" cy="50" r="10" fill="#fff8fd" opacity="0.9" />
      </g>
    </svg>
  );
}

function FallingDecorLayer({
  type,
}: {
  type: "falling-hearts" | "falling-petals";
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${2 + ((i * 7) % 96)}%`,
        delay: `${(i % 10) * 0.4}s`,
        duration: 9.5 + (i % 6) * 1.1,
        size: 44 + (i % 6) * 10,
        dx: -80 + (i % 14) * 12,
        rotateStart: `${(i * 29) % 360}deg`,
        rotateEnd: `${200 + (i % 8) * 30}deg`,
        rotateX: `${240 + (i % 6) * 18}deg`,
        rotateY: `${200 + (i % 7) * 20}deg`,
        scale: 0.82 + (i % 4) * 0.12,
      })),
    [type],
  );

  return (
    <div className="romantic-3d-layer">
      {particles.map((item) => (
        <div
          key={item.id}
          className="romantic-falling-particle"
          style={{
            left: item.left,
            animation: `
              romantic-fall-3d ${item.duration}s linear ${item.delay} infinite,
              romantic-sway-3d ${4.8 + (item.id % 4) * 0.6}s ease-in-out ${item.delay} infinite,
              romantic-shimmer-3d ${3.8 + (item.id % 3) * 0.5}s ease-in-out ${item.delay} infinite
            `,
            ["--dx" as string]: `${item.dx}px`,
            ["--rz0" as string]: item.rotateStart,
            ["--rz1" as string]: item.rotateEnd,
            ["--rx" as string]: item.rotateX,
            ["--ry" as string]: item.rotateY,
            ["--s" as string]: `${item.scale}`,
          }}
        >
          {type === "falling-hearts" ? (
            <Heart3D size={item.size} />
          ) : (
            <Flower3D size={item.size} />
          )}
        </div>
      ))}
    </div>
  );
}

function SparkleHeartsLayer() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: `${2 + ((i * 8) % 96)}%`,
        top: `${4 + ((i * 9) % 88)}%`,
        delay: `${(i % 8) * 0.24}s`,
        size: 34 + (i % 5) * 10,
        scale: 0.8 + (i % 4) * 0.14,
        rotate: `${(i * 19) % 360}deg`,
      })),
    [],
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${1 + ((i * 5.7) % 98)}%`,
        top: `${2 + ((i * 7.1) % 94)}%`,
        size: 8 + (i % 4) * 5,
        delay: `${(i % 12) * 0.16}s`,
        scale: 0.8 + (i % 3) * 0.18,
        rotate: `${(i * 31) % 360}deg`,
        color: i % 3 === 0 ? "#fff7fb" : i % 3 === 1 ? "#ffd8ea" : "#ffffff",
      })),
    [],
  );

  return (
    <div className="romantic-3d-layer">
      {hearts.map((item) => (
        <div
          key={`heart-${item.id}`}
          className="romantic-sparkle-particle"
          style={{
            left: item.left,
            top: item.top,
            animation: `
              romantic-sparkle-float ${4.6 + (item.id % 4) * 0.55}s ease-in-out ${item.delay} infinite,
              romantic-sparkle-glow ${3.4 + (item.id % 3) * 0.45}s ease-in-out ${item.delay} infinite
            `,
            ["--r" as string]: item.rotate,
            ["--s" as string]: `${item.scale}`,
          }}
        >
          <Heart3D size={item.size} />
        </div>
      ))}

      {sparkles.map((item) => (
        <div
          key={`sparkle-${item.id}`}
          className="romantic-sparkle-particle"
          style={{
            left: item.left,
            top: item.top,
            animation: `
              romantic-twinkle ${3 + (item.id % 5) * 0.45}s ease-in-out ${item.delay} infinite,
              romantic-sparkle-glow ${3.2 + (item.id % 4) * 0.35}s ease-in-out ${item.delay} infinite
            `,
            ["--r" as string]: item.rotate,
            ["--s" as string]: `${item.scale}`,
          }}
        >
          <SparkleStar size={item.size} color={item.color} />
        </div>
      ))}
    </div>
  );
}
const DESIGN_WIDTH = 1400;
const DESIGN_HEIGHT = 900;

function toXPercent(value: number) {
  return `${(value / DESIGN_WIDTH) * 100}%`;
}

function toYPercent(value: number) {
  return `${(value / DESIGN_HEIGHT) * 100}%`;
}

export function StorySceneViewer({
  scenes,
  animation,
}: {
  scenes: StoryScene[];
  animation: AnimationType;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [sceneBookPages, setSceneBookPages] = useState<Record<string, number>>(
    {},
  );

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
      [sceneId]: page,
    }));
  };

  if (!scene) return null;

  const goToScene = (nextIndex: number) => {
    if (
      nextIndex === activeIndex ||
      nextIndex < 0 ||
      nextIndex >= scenes.length
    ) {
      return;
    }

    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex(nextIndex);
  };

  const normalizedName = (scene.name || "").trim().toLowerCase();

  const isGameScene =
    activeIndex === 2 ||
    normalizedName === "background 3" ||
    normalizedName === "scene 3";

  const isPuzzleScene =
    activeIndex === 3 ||
    normalizedName === "background 4" ||
    normalizedName === "scene 4";

  const currentBookPage =
    scene.book?.enabled && typeof sceneBookPages[scene.id] === "number"
      ? sceneBookPages[scene.id]
      : (scene.book?.currentPage ?? -1);

  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden"
      style={{ background: scene.background }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={scene.id}
          custom={direction}
          initial={{
            opacity: 0,
            x: direction > 0 ? 80 : -80,
            scale: 1.02,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            x: direction > 0 ? -80 : 80,
            scale: 0.985,
            filter: "blur(8px)",
          }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0"
        >
          <div
            className="relative h-[100svh] w-full overflow-hidden"
            style={{ background: scene.background }}
          >
            <Romantic3DStyles />

            {isPuzzleScene ? (
              <PuzzleGameScene
                imageUrl={scene.puzzleImage}
                timeLimitSeconds={scene.puzzleTimeLimit ?? 60}
              />
            ) : isGameScene ? (
              <FlappyBirdScene
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
                      style={{
                        objectPosition: `${scene.backgroundPositionX ?? 50}% ${
                          scene.backgroundPositionY ?? 75
                        }%`,
                      }}
                      initial={{ scale: 1.08, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.96, opacity: 0.65 }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="absolute inset-0 bg-slate-950/45" />
                  </>
                ) : null}

                {animation === "falling-hearts" ? (
                  <FallingDecorLayer type="falling-hearts" />
                ) : null}

                {animation === "falling-petals" ? (
                  <FallingDecorLayer type="falling-petals" />
                ) : null}

                {animation === "sparkle-hearts" ? (
                  <SparkleHeartsLayer />
                ) : null}

                {scene.book?.enabled ? (
                  <>
                    {/* Desktop / tablet album */}
                    <motion.div
                      className="absolute z-[70] hidden sm:block"
                      style={{
                        left: scene.book.x,
                        top: scene.book.y,
                        width: scene.book.w,
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
                        onCurrentPageChange={(page) =>
                          handleBookPageChange(scene.id, page)
                        }
                        width={scene.book.w}
                        height={scene.book.h}
                        coverImage={
                          scene.book.coverImage || scene.backgroundImage
                        }
                        coverPositionX={scene.book.coverPositionX ?? 50}
                        coverPositionY={scene.book.coverPositionY ?? 50}
                        title={
                          scene.book.title || `${scene.name} Memory Book`
                        }
                      />
                    </motion.div>

{/* Mobile album */}
<motion.div
  className="absolute left-1/2 top-[95px] z-[70] block w-[90vw] max-w-[300px] -translate-x-1/2 sm:hidden"
  initial={{ opacity: 0, y: 24, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -18, scale: 0.96 }}
  transition={{ duration: 0.65, delay: 0.12 }}
>
  <MemoryBook
    pageCount={scene.book.pageCount}
    pages={scene.book.pages}
    currentPage={currentBookPage}
    onCurrentPageChange={(page) => handleBookPageChange(scene.id, page)}
    width={290}
    height={215}
    coverImage={scene.book.coverImage || scene.backgroundImage}
    coverPositionX={scene.book.coverPositionX ?? 50}
    coverPositionY={scene.book.coverPositionY ?? 50}
    title={scene.book.title || `${scene.name} Memory Book`}
  />
</motion.div>
                  </>
                ) : null}

                <div className="absolute inset-0 bg-black/10" />

                {/* Desktop / tablet layout */}
                <div className="hidden sm:block">
                  {scene.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="absolute"
                      style={{
                        left: item.x,
                        top: item.y,
                        width: item.w,
                        height: item.h,
                        zIndex: (item.z ?? 1) + 20,
                      }}
                      initial={{
                        opacity: 0,
                        y: 26,
                        scale: 0.97,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -20,
                        scale: 0.97,
                      }}
                      transition={{
                        duration: 0.45,
                        delay: 0.12 + index * 0.05,
                      }}
                    >
                      {item.type === "text" ? (
                        <div
                          className="whitespace-pre-wrap"
                          style={{
                            color: item.color || "#fff",
                            fontSize: item.fontSize || 24,
                            fontWeight: item.fontWeight || 700,
                            textShadow: "0 6px 30px rgba(0,0,0,0.35)",
                          }}
                        >
                          {item.content}
                        </div>
                      ) : item.src ? (
                        <img
                          src={item.src}
                          alt="Story memory"
                          className="h-full w-full rounded-[1.75rem] object-cover shadow-2xl"
                          style={{
                            objectPosition: `${item.imagePositionX ?? 50}% ${
                              item.imagePositionY ?? 65
                            }%`,
                          }}
                        />
                      ) : null}
                    </motion.div>
                  ))}
                </div>

                {/* Mobile layout */}
                <div className="absolute inset-x-0 top-0 z-[40] h-[100svh] overflow-y-auto px-5 pb-32 pt-20 sm:hidden">
                  <div className="flex min-h-[100svh] w-full flex-col items-center">
                    {scene.items
                      .slice()
                      .sort((a, b) => a.y - b.y)
                      .map((item, index) => {
                        const isImage = item.type === "image";

                        return (
                          <motion.div
                            key={`mobile-${item.id}`}
                            className={`w-full ${
                              isImage
                                ? "mt-20 mb-10 max-w-[260px]"
                                : "mb-7 max-w-[340px]"
                            }`}
                            initial={{
                              opacity: 0,
                              y: 22,
                              scale: 0.97,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              y: -18,
                              scale: 0.97,
                            }}
                            transition={{
                              duration: 0.45,
                              delay: 0.12 + index * 0.05,
                            }}
                          >
                            {item.type === "text" ? (
                              <div
                                className="whitespace-pre-wrap break-words text-center leading-tight"
                                style={{
                                  color: item.color || "#fff",
                                  fontSize: `clamp(24px, ${
                                    ((item.fontSize || 28) / 1400) * 100
                                  }vw, ${Math.min(
                                    item.fontSize || 28,
                                    42,
                                  )}px)`,
                                  fontWeight: item.fontWeight || 700,
                                  textShadow:
                                    "0 6px 30px rgba(0,0,0,0.45)",
                                  overflowWrap: "anywhere",
                                  wordBreak: "break-word",
                                }}
                              >
                                {item.content}
                              </div>
                            ) : item.src ? (
                              <div className="mx-auto w-full overflow-hidden rounded-[1.25rem] shadow-2xl">
                                <img
                                  src={item.src}
                                  alt="Story memory"
                                  className="h-auto w-full object-contain"
                                  style={{
                                    objectPosition: `${
                                      item.imagePositionX ?? 50
                                    }% ${item.imagePositionY ?? 65}%`,
                                  }}
                                />
                              </div>
                            ) : null}
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute left-1/2 top-5 z-[95] flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-md sm:top-6">
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

      <div className="absolute bottom-5 left-1/2 z-[95] flex w-full max-w-[360px] -translate-x-1/2 justify-center gap-3 px-4 sm:bottom-8 sm:left-auto sm:right-8 sm:w-auto sm:max-w-none sm:translate-x-0 sm:px-0">
        {activeIndex > 0 ? (
          <button
            type="button"
            onClick={() => goToScene(activeIndex - 1)}
            className="rounded-full border border-white/20 bg-black/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-black/45 sm:px-6 sm:text-sm"
          >
            Previous
          </button>
        ) : null}

        {activeIndex < scenes.length - 1 ? (
          <button
            type="button"
            onClick={() => goToScene(activeIndex + 1)}
            className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-xl transition hover:scale-[1.02] sm:px-6 sm:text-sm"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goToScene(0)}
            className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-xl transition hover:scale-[1.02] sm:px-6 sm:text-sm"
          >
            Back to Start
          </button>
        )}
      </div>
    </section>
  );
}