"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Move, ZoomIn, ZoomOut } from "lucide-react";
import { EditorItem } from "@/lib/templates";
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

type Props = {
  items: EditorItem[];
  background: string;
  coverImage?: string;
  animation?: AnimationType;
  book?: BookData;
  onBookFlip?: (page: number) => void;
  onBookPageDoubleClick?: (encodedSlotIndex: number) => void;
  onBookChange?: (patch: Partial<BookData>) => void;
  onChange: (items: EditorItem[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onImageClick?: (id: string) => void;
  isGameScene?: boolean;
  challengeTarget?: number | null;
  isPuzzleScene?: boolean;
  puzzleImage?: string;
  puzzleTimeLimit?: number;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  onBackgroundPositionChange?: (
    patch: { backgroundPositionX: number; backgroundPositionY: number }
  ) => void;
};

type DragState =
  | {
      kind: "item";
      id: string;
      startX: number;
      startY: number;
      itemX: number;
      itemY: number;
    }
  | {
      kind: "book";
      startX: number;
      startY: number;
      itemX: number;
      itemY: number;
    }
  | null;

type ResizeState =
  | {
      kind: "item";
      id: string;
      startX: number;
      startY: number;
      itemW: number;
      itemH: number;
      itemX: number;
      itemY: number;
    }
  | {
      kind: "book";
      startX: number;
      startY: number;
      itemW: number;
      itemH: number;
      itemX: number;
      itemY: number;
    }
  | null;

type PanState =
  | {
      id: string;
      startX: number;
      startY: number;
      startPositionX: number;
      startPositionY: number;
      itemW: number;
      itemH: number;
    }
  | null;

type BackgroundPanState =
  | {
      startX: number;
      startY: number;
      startPositionX: number;
      startPositionY: number;
      containerW: number;
      containerH: number;
    }
  | null;

// Scenes are laid out in pixels. Below this width the canvas keeps the design size and is
// scaled down to fit, so narrow screens show the whole scene instead of its left edge.
export const DESIGN_WIDTH = 1000;
export const STAGE_HEIGHT = 760;
const DOUBLE_TAP_MS = 350;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

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
    [type]
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
    []
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
        color:
          i % 3 === 0 ? "#fff7fb" : i % 3 === 1 ? "#ffd8ea" : "#ffffff",
      })),
    []
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

export function LayoutEditor({
  items,
  background,
  coverImage,
  animation = "none",
  book,
  onBookFlip,
  onBookPageDoubleClick,
  onBookChange,
  onChange,
  selectedId,
  onSelect,
  onImageClick,
  isGameScene = false,
  challengeTarget = null,
  isPuzzleScene = false,
  puzzleImage,
  puzzleTimeLimit = 60,
  backgroundPositionX = 50,
  backgroundPositionY = 50,
  onBackgroundPositionChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);
  const [frameWidth, setFrameWidth] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [dragState, setDragState] = useState<DragState>(null);
  const [resizeState, setResizeState] = useState<ResizeState>(null);
  const [panState, setPanState] = useState<PanState>(null);
  const [backgroundPanState, setBackgroundPanState] =
    useState<BackgroundPanState>(null);
  const [isBackgroundMoveMode, setIsBackgroundMoveMode] = useState(false);

  const fitsDesign = frameWidth === null || frameWidth >= DESIGN_WIDTH;
  const fitScale = fitsDesign ? 1 : (frameWidth as number) / DESIGN_WIDTH;
  const scale = zoomed ? Math.min(1, fitScale * 2) : fitScale;

  const updateItem = (id: string, patch: Partial<EditorItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => setFrameWidth(frame.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isGameScene || isPuzzleScene) return;

    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Pointer distances are in screen pixels; the canvas may be scaled down.
      const moveX = (startX: number) => Math.round((e.clientX - startX) / scale);
      const moveY = (startY: number) => Math.round((e.clientY - startY) / scale);

      if (dragState?.kind === "item") {
        const item = items.find((x) => x.id === dragState.id);
        if (!item) return;

        const dx = moveX(dragState.startX);
        const dy = moveY(dragState.startY);

        const nextX = Math.max(
          0,
          Math.min(dragState.itemX + dx, container.clientWidth - item.w)
        );
        const nextY = Math.max(
          0,
          Math.min(dragState.itemY + dy, container.clientHeight - item.h)
        );

        updateItem(dragState.id, { x: nextX, y: nextY });
      }

      if (dragState?.kind === "book" && book && onBookChange) {
        const dx = moveX(dragState.startX);
        const dy = moveY(dragState.startY);

        const nextX = Math.max(
          0,
          Math.min(dragState.itemX + dx, container.clientWidth - book.w)
        );
        const nextY = Math.max(
          0,
          Math.min(dragState.itemY + dy, container.clientHeight - book.h)
        );

        onBookChange({ x: nextX, y: nextY });
      }

      if (resizeState?.kind === "item") {
        const minWidth = 120;
        const minHeight = 60;
        const dx = moveX(resizeState.startX);
        const dy = moveY(resizeState.startY);

        const nextW = Math.max(
          minWidth,
          Math.min(resizeState.itemW + dx, container.clientWidth - resizeState.itemX)
        );
        const nextH = Math.max(
          minHeight,
          Math.min(resizeState.itemH + dy, container.clientHeight - resizeState.itemY)
        );

        updateItem(resizeState.id, { w: nextW, h: nextH });
      }

      if (resizeState?.kind === "book" && book && onBookChange) {
        const minWidth = 360;
        const minHeight = 240;
        const dx = moveX(resizeState.startX);
        const dy = moveY(resizeState.startY);

        const nextW = Math.max(
          minWidth,
          Math.min(resizeState.itemW + dx, container.clientWidth - resizeState.itemX)
        );
        const nextH = Math.max(
          minHeight,
          Math.min(resizeState.itemH + dy, container.clientHeight - resizeState.itemY)
        );

        onBookChange({ w: nextW, h: nextH });
      }

      if (panState) {
        const dx = moveX(panState.startX);
        const dy = moveY(panState.startY);

        const nextPositionX = clamp(
          panState.startPositionX - (dx / Math.max(panState.itemW, 1)) * 100,
          0,
          100
        );

        const nextPositionY = clamp(
          panState.startPositionY - (dy / Math.max(panState.itemH, 1)) * 100,
          0,
          100
        );

        updateItem(panState.id, {
          imagePositionX: nextPositionX,
          imagePositionY: nextPositionY,
        });
      }

      if (backgroundPanState && onBackgroundPositionChange) {
        const dx = moveX(backgroundPanState.startX);
        const dy = moveY(backgroundPanState.startY);

        const nextPositionX = clamp(
          backgroundPanState.startPositionX -
            (dx / Math.max(backgroundPanState.containerW, 1)) * 100,
          0,
          100
        );

        const nextPositionY = clamp(
          backgroundPanState.startPositionY -
            (dy / Math.max(backgroundPanState.containerH, 1)) * 100,
          0,
          100
        );

        onBackgroundPositionChange({
          backgroundPositionX: nextPositionX,
          backgroundPositionY: nextPositionY,
        });
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
      setResizeState(null);
      setPanState(null);
      setBackgroundPanState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [
    dragState,
    resizeState,
    panState,
    backgroundPanState,
    items,
    book,
    onBookChange,
    onBackgroundPositionChange,
    isGameScene,
    isPuzzleScene,
    scale,
  ]);

  // Touch screens have no reliable double-click, so two quick taps on an image box count as one.
  const handleImageTap = (id: string, pointerType: string) => {
    if (pointerType === "mouse") return;

    const now = Date.now();
    const last = lastTapRef.current;

    if (last && last.id === id && now - last.time < DOUBLE_TAP_MS) {
      lastTapRef.current = { id: "", time: now };
      onImageClick?.(id);
      return;
    }

    lastTapRef.current = { id, time: now };
  };

  // Some browsers also send a double-click after two taps; do not open the picker twice.
  const openedByTapJustNow = () => {
    const last = lastTapRef.current;
    return Boolean(last && last.id === "" && Date.now() - last.time < 800);
  };

  if (isGameScene) {
    return (
      <div
        ref={containerRef}
        className="relative isolate z-0 mx-auto h-[min(760px,82svh)] min-h-[520px] w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950 sm:rounded-[2rem]"
      >
        <FlappyBirdScene />
      </div>
    );
  }

  if (isPuzzleScene) {
    return (
      <div
        ref={containerRef}
        className="relative isolate z-0 mx-auto h-[min(760px,82svh)] min-h-[520px] w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950 sm:rounded-[2rem]"
      >
        <PuzzleGameScene
          imageUrl={puzzleImage}
          timeLimitSeconds={puzzleTimeLimit}
        />
      </div>
    );
  }

  // Handles and hints are drawn inside the scaled canvas, so grow them back to a usable size.
  const handleSize = scale === 1 ? 24 : Math.min(120, Math.round(32 / scale));
  const outlineWidth = Math.min(6, 2 / scale);
  const hintFontSize = Math.min(34, Math.round(14 / scale));

  return (
    <div data-zoomed={zoomed && !fitsDesign ? "true" : undefined}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
        <p className="hidden text-xs font-medium leading-5 text-slate-500 sm:block">
          Drag to move, pull the pink corner to resize.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {coverImage ? (
            <button
              type="button"
              onClick={() => setIsBackgroundMoveMode((prev) => !prev)}
              aria-pressed={isBackgroundMoveMode}
              className={`btn min-h-[40px] px-4 text-xs ${
                isBackgroundMoveMode ? "btn-primary" : "btn-secondary"
              }`}
            >
              <Move className="h-4 w-4" />
              {isBackgroundMoveMode ? "Stop moving background" : "Drag background to adjust focus"}
            </button>
          ) : null}

          {!fitsDesign ? (
            <button
              type="button"
              onClick={() => setZoomed((prev) => !prev)}
              aria-pressed={zoomed}
              className="btn btn-secondary min-h-[40px] px-4 text-xs"
            >
              {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              {zoomed ? "Fit to screen" : "Zoom in"}
            </button>
          ) : null}
        </div>
      </div>

      <div
        ref={frameRef}
        className={`relative w-full overflow-y-hidden rounded-[1.25rem] border border-white/10 bg-slate-950 sm:rounded-[2rem] ${
          zoomed ? "overflow-x-auto" : "overflow-x-hidden"
        }`}
        style={{ height: Math.round(STAGE_HEIGHT * scale) }}
      >
        <div
          ref={containerRef}
          className="relative isolate z-0 overflow-hidden"
          style={{
            background,
            width: fitsDesign ? "100%" : DESIGN_WIDTH,
            height: STAGE_HEIGHT,
            transform: scale === 1 ? undefined : `scale(${scale})`,
            transformOrigin: "top left",
          }}
          onPointerDown={() => onSelect(null)}
        >
          <Romantic3DStyles />

          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt="Editor background"
                className={`absolute inset-0 z-0 h-full w-full object-cover ${
                  isBackgroundMoveMode ? "touch-none" : ""
                }`}
                style={{
                  objectPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
                  cursor: isBackgroundMoveMode ? "grabbing" : "default",
                }}
                draggable={false}
                onPointerDown={(e) => {
                  if (!isBackgroundMoveMode || !onBackgroundPositionChange || !containerRef.current) {
                    return;
                  }

                  e.stopPropagation();
                  setBackgroundPanState({
                    startX: e.clientX,
                    startY: e.clientY,
                    startPositionX: backgroundPositionX,
                    startPositionY: backgroundPositionY,
                    containerW: containerRef.current.clientWidth,
                    containerH: containerRef.current.clientHeight,
                  });
                }}
              />
              <div className="pointer-events-none absolute inset-0 z-0 bg-slate-950/40" />
            </>
          ) : null}

          {animation === "falling-hearts" ? <FallingDecorLayer type="falling-hearts" /> : null}
          {animation === "falling-petals" ? <FallingDecorLayer type="falling-petals" /> : null}
          {animation === "sparkle-hearts" ? <SparkleHeartsLayer /> : null}

          {items
            .slice()
            .sort((a, b) => a.z - b.z)
            .map((item) => {
              const isSelected = selectedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`absolute z-[10] touch-none ${item.type === "image" ? "overflow-hidden" : ""} ${
                    isBackgroundMoveMode ? "pointer-events-none" : ""
                  }`}
                  style={{
                    left: item.x,
                    top: item.y,
                    width: item.w,
                    height: item.h,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onSelect(item.id);
                    setDragState({
                      kind: "item",
                      id: item.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      itemX: item.x,
                      itemY: item.y,
                    });
                  }}
                  onPointerUp={(e) => {
                    if (item.type === "image") {
                      handleImageTap(item.id, e.pointerType);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (item.type === "image" && !openedByTapJustNow()) {
                      onImageClick?.(item.id);
                    }
                  }}
                >
                  {item.type === "text" ? (
                    <div
                      className="scene-text h-full w-full whitespace-pre-wrap rounded-2xl px-2 py-1"
                      style={{
                        fontSize: item.fontSize ?? 24,
                        color: item.color ?? "#ffffff",
                        fontWeight: item.fontWeight ?? 700,
                        textShadow: "0 6px 30px rgba(0,0,0,0.35)",
                      }}
                    >
                      {item.content}
                    </div>
                  ) : item.src ? (
                    <img
                      src={item.src}
                      alt="Editor block"
                      className="h-full w-full rounded-[1.75rem] object-cover shadow-2xl"
                      style={{
                        objectPosition: `${item.imagePositionX ?? 50}% ${item.imagePositionY ?? 50}%`,
                      }}
                      draggable={false}
                      onPointerDown={(e) => {
                        if (!isSelected || !item.src) return;

                        e.stopPropagation();
                        setPanState({
                          id: item.id,
                          startX: e.clientX,
                          startY: e.clientY,
                          startPositionX: item.imagePositionX ?? 50,
                          startPositionY: item.imagePositionY ?? 50,
                          itemW: item.w,
                          itemH: item.h,
                        });
                      }}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-[1.75rem] border border-dashed border-white/30 bg-black/20 px-4 text-center text-white/70"
                      style={{ fontSize: hintFontSize, lineHeight: 1.3 }}
                    >
                      Double-click or tap twice to add image
                    </div>
                  )}

                  {isSelected ? (
                    <>
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[1.75rem] border-pink-400"
                        style={{ borderWidth: outlineWidth, borderStyle: "solid" }}
                      />
                      <button
                        type="button"
                        aria-label="Resize"
                        className="absolute z-[12] touch-none rounded-full border-2 border-white bg-pink-500 shadow-lg"
                        style={{
                          width: handleSize,
                          height: handleSize,
                          right: item.type === "image" ? 0 : -handleSize / 2,
                          bottom: item.type === "image" ? 0 : -handleSize / 2,
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setResizeState({
                            kind: "item",
                            id: item.id,
                            startX: e.clientX,
                            startY: e.clientY,
                            itemW: item.w,
                            itemH: item.h,
                            itemX: item.x,
                            itemY: item.y,
                          });
                        }}
                      />
                    </>
                  ) : null}
                </div>
              );
            })}

          {book?.enabled ? (
            <div
              className={`absolute z-[20] touch-none ${
                isBackgroundMoveMode ? "pointer-events-none" : ""
              }`}
              style={{
                left: book.x,
                top: book.y,
                width: book.w,
                height: book.h,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelect(null);
                setDragState({
                  kind: "book",
                  startX: e.clientX,
                  startY: e.clientY,
                  itemX: book.x,
                  itemY: book.y,
                });
              }}
            >
              <MemoryBook
                pageCount={book.pageCount}
                pages={book.pages}
                editable
                currentPage={book.currentPage}
                onCurrentPageChange={onBookFlip}
                onUploadPage={onBookPageDoubleClick}
                width={book.w}
                height={book.h}
                coverImage={book.coverImage || coverImage}
                coverPositionX={book.coverPositionX ?? 50}
                coverPositionY={book.coverPositionY ?? 50}
                title={book.title}
              />

              <button
                type="button"
                aria-label="Resize album"
                className="absolute z-[21] touch-none rounded-full border-2 border-white bg-pink-500 shadow-lg"
                style={{
                  width: handleSize,
                  height: handleSize,
                  right: -handleSize / 2,
                  bottom: -handleSize / 2,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setResizeState({
                    kind: "book",
                    startX: e.clientX,
                    startY: e.clientY,
                    itemW: book.w,
                    itemH: book.h,
                    itemX: book.x,
                    itemY: book.y,
                  });
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
