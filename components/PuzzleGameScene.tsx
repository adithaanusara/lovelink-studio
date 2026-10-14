"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

type Props = {
  imageUrl?: string;
  timeLimitSeconds?: number;
  // The published page draws its scene dots and Previous / Next buttons over the game, so
  // space is kept free for them. The editor preview has neither.
  reserveNavSpace?: boolean;
};

const MAX_BOARD_SIZE = 620;

const COLS = 3;
const ROWS = 3;
const TOTAL = COLS * ROWS;
const EMPTY_TILE = TOTAL - 1;

function createSolvedTiles() {
  return Array.from({ length: TOTAL }, (_, index) => index);
}

function isSolved(tiles: number[]) {
  return tiles.every((tile, index) => tile === index);
}

function getRow(index: number) {
  return Math.floor(index / COLS);
}

function getCol(index: number) {
  return index % COLS;
}

function isAdjacent(indexA: number, indexB: number) {
  const rowA = getRow(indexA);
  const colA = getCol(indexA);
  const rowB = getRow(indexB);
  const colB = getCol(indexB);

  const rowDiff = Math.abs(rowA - rowB);
  const colDiff = Math.abs(colA - colB);

  return rowDiff + colDiff === 1;
}

function countInversions(tiles: number[]) {
  const filtered = tiles.filter((tile) => tile !== EMPTY_TILE);
  let inversions = 0;

  for (let i = 0; i < filtered.length; i += 1) {
    for (let j = i + 1; j < filtered.length; j += 1) {
      if (filtered[i] > filtered[j]) {
        inversions += 1;
      }
    }
  }

  return inversions;
}

function isSolvable(tiles: number[]) {
  return countInversions(tiles) % 2 === 0;
}

function shuffleTiles() {
  const tiles = createSolvedTiles();

  do {
    for (let i = tiles.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (isSolved(tiles) || !isSolvable(tiles));

  return tiles;
}

export function PuzzleGameScene({
  imageUrl,
  timeLimitSeconds = 60,
  reserveNavSpace = true
}: Props) {
  const [tiles, setTiles] = useState<number[]>(createSolvedTiles());
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [peek, setPeek] = useState(false);
  const boardAreaRef = useRef<HTMLDivElement | null>(null);
  const [boardSize, setBoardSize] = useState<number | null>(null);

  // The board is a square as large as the space left for it, so it always fits the screen
  // without scrolling, upright or sideways.
  useEffect(() => {
    const area = boardAreaRef.current;
    if (!area) return;

    const measure = () =>
      setBoardSize(
        Math.max(
          120,
          Math.floor(Math.min(area.clientWidth, area.clientHeight, MAX_BOARD_SIZE))
        )
      );
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(area);

    return () => observer.disconnect();
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl) {
      setTiles(createSolvedTiles());
      setTimeLeft(timeLimitSeconds);
      setStarted(false);
      setWon(false);
      setLost(false);
      return;
    }

    setTiles(shuffleTiles());
    setTimeLeft(timeLimitSeconds);
    setStarted(false);
    setWon(false);
    setLost(false);
  }, [imageUrl, timeLimitSeconds]);

  useEffect(() => {
    if (!started || won || lost) return;

    if (timeLeft <= 0) {
      setLost(true);
      setStarted(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [started, timeLeft, won, lost]);

  const handleTileClick = (clickedIndex: number) => {
    if (!imageUrl || won || lost) return;

    const emptyIndex = tiles.indexOf(EMPTY_TILE);

    if (!isAdjacent(clickedIndex, emptyIndex)) {
      return;
    }

    if (!started) {
      setStarted(true);
    }

    const next = [...tiles];
    [next[clickedIndex], next[emptyIndex]] = [next[emptyIndex], next[clickedIndex]];
    setTiles(next);

    if (isSolved(next)) {
      setWon(true);
      setStarted(false);
    }
  };

  const resetGame = () => {
    if (!imageUrl) return;

    setTiles(shuffleTiles());
    setTimeLeft(timeLimitSeconds);
    setStarted(false);
    setWon(false);
    setLost(false);
    setPeek(false);
  };

  const tileSizeStyles = useMemo(
    () => ({
      backgroundSize: `${COLS * 100}% ${ROWS * 100}%`
    }),
    []
  );

  if (!imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 p-4 text-center text-white">
        <div className="max-w-sm rounded-[2rem] border border-white/10 bg-black/30 px-6 py-6 backdrop-blur-md sm:px-8">
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-200 sm:text-sm">Puzzle Game</div>
          <div className="mt-3 text-xl font-bold sm:text-2xl">Upload an image for Background 4</div>
          <div className="mt-2 text-sm text-white/75">
            The image will be split into a 3 x 3 sliding puzzle.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b1020] text-white">
      <style>{`
        @keyframes puzzle-pop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt="Puzzle background"
          className="absolute inset-0 h-full w-full object-cover opacity-20 blur-xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#6d28d940,transparent_40%),linear-gradient(to_bottom,#0b1020ee,#111827f2)]" />
      </div>

      {/* Upright: details on top, board below. Sideways phones and large screens: board on the
          left, details on the right, which keeps the board clear of the Previous / Next buttons. */}
      <div
        className={`absolute inset-0 flex flex-col gap-3 px-3 sm:px-6 max-lg:landscape:flex-row max-lg:landscape:px-3 lg:flex-row lg:gap-6 ${
          reserveNavSpace
            ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(3.75rem+env(safe-area-inset-top))] max-lg:landscape:pb-3 max-lg:landscape:pt-14 lg:pt-20"
            : "py-3 sm:py-4"
        }`}
      >
        <div
          ref={boardAreaRef}
          className="order-2 flex min-h-0 min-w-0 flex-1 items-center justify-center max-lg:landscape:order-1 max-lg:landscape:items-start lg:order-1"
        >
          <div
            className="relative"
            style={{
              width: boardSize ?? `min(100%, ${MAX_BOARD_SIZE}px)`,
              aspectRatio: "1 / 1"
            }}
          >
            <div
              className="grid h-full w-full gap-1.5 rounded-[1.25rem] bg-black/25 p-1.5 sm:gap-2 sm:p-2"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`
              }}
            >
              {tiles.map((tileValue, slotIndex) => {
                const emptyIndex = tiles.indexOf(EMPTY_TILE);
                const canMove = isAdjacent(slotIndex, emptyIndex);

                if (tileValue === EMPTY_TILE) {
                  return (
                    <div
                      key={`empty-${slotIndex}`}
                      className="rounded-xl border border-dashed border-white/20 bg-white/5 sm:rounded-2xl"
                    />
                  );
                }

                const correctCol = tileValue % COLS;
                const correctRow = Math.floor(tileValue / COLS);

                return (
                  <button
                    key={`${slotIndex}-${tileValue}`}
                    type="button"
                    onClick={() => handleTileClick(slotIndex)}
                    aria-label={`Puzzle piece ${tileValue + 1}${canMove ? ", can move" : ""}`}
                    className={`relative touch-manipulation select-none overflow-hidden rounded-xl border-2 transition sm:rounded-2xl ${
                      canMove
                        ? "border-cyan-300/80 hover:scale-[1.02] hover:border-cyan-200"
                        : "border-white/10"
                    }`}
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundPosition: `${(correctCol / (COLS - 1)) * 100}% ${
                        (correctRow / (ROWS - 1)) * 100
                      }%`,
                      ...tileSizeStyles
                    }}
                  />
                );
              })}
            </div>

            {peek ? (
              <button
                type="button"
                onClick={() => setPeek(false)}
                className="absolute inset-0 z-10 overflow-hidden rounded-[1.25rem] border-2 border-pink-300/80 shadow-2xl"
                aria-label="Hide the finished photo"
              >
                <img
                  src={imageUrl}
                  alt="Finished puzzle photo"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Tap to hide
                </span>
              </button>
            ) : null}
          </div>
        </div>

        {/* On sideways phones this panel is as wide as the Previous / Next buttons, which sit
            under it in the bottom-right corner, so they never cover the board. */}
        <div
          className={`order-1 flex shrink-0 flex-col gap-3 max-lg:landscape:order-2 max-lg:landscape:w-[360px] max-lg:landscape:overflow-y-auto lg:order-2 lg:w-[340px] lg:overflow-y-auto ${
            reserveNavSpace ? "max-lg:landscape:pb-20" : ""
          }`}
        >
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPeek((prev) => !prev)}
                aria-pressed={peek}
                aria-label={peek ? "Hide the finished photo" : "Show the finished photo"}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/20 lg:hidden"
              >
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[9px] font-bold uppercase tracking-[0.12em]">
                  {peek ? "Hide" : "Peek"}
                </span>
              </button>

              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-200">
                  Sliding puzzle
                </div>
                <div className="truncate text-xl font-black sm:text-2xl">Solve to unlock</div>
              </div>

              <div
                role="timer"
                className={`shrink-0 rounded-2xl px-3 py-1.5 text-center transition-colors ${
                  started && timeLeft <= 10 ? "bg-rose-500 text-white" : "bg-white/90 text-slate-900"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                  Time
                </div>
                <div className="text-2xl font-black leading-none tabular-nums">{timeLeft}s</div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <p className="min-w-0 flex-1 text-xs leading-5 text-white/75 sm:text-sm">
                Tap a tile next to the empty square to slide it.
              </p>

              <button
                type="button"
                onClick={resetGame}
                className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restart
              </button>
            </div>
          </div>

          {/* Large screens have room for the full reference photo and the rules */}
          <div className="hidden rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-xl lg:block">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-pink-200">
              Original Photo
            </div>

            <div className="mt-3 overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20">
              <img
                src={imageUrl}
                alt="Original puzzle reference"
                className="max-h-[240px] w-full object-cover"
              />
            </div>

            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>• This is a 3 x 3 sliding puzzle with one empty square.</li>
              <li>• Click a tile next to the empty square to move it.</li>
              <li>• Complete the photo before time runs out.</li>
            </ul>
          </div>
        </div>
      </div>

{(won || lost) && (
  <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
    <div
      className="max-h-full w-full max-w-[520px] overflow-y-auto rounded-[2rem] border border-white/15 bg-white/10 p-5 text-center text-white shadow-2xl backdrop-blur-2xl"
      style={{ animation: "puzzle-pop 0.35s ease-out" }}
    >
      <div className="text-xs font-bold uppercase tracking-[0.4em] text-pink-200">
        {won ? "Puzzle Completed" : "Time’s Up"}
      </div>

      <div className="mt-3 text-2xl font-black leading-tight sm:text-3xl md:text-5xl">
        {won ? (
          <>
            You Unlocked
            <br />
            This Memory 💖
          </>
        ) : (
          <>
            Try Again
            <br />
            My Love
          </>
        )}
      </div>

      {won ? (
        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/20 bg-black/20 shadow-2xl">
          <img
            src={imageUrl}
            alt="Unlocked memory"
            className="max-h-[38svh] w-full object-contain"
          />
        </div>
      ) : null}

      <div className="mt-4 text-sm font-semibold leading-relaxed text-white/85 md:text-base">
        {won
          ? "Every piece came together beautifully, just like this memory."
          : "Try again and complete the image before time runs out."}
      </div>

      <button
        type="button"
        onClick={resetGame}
        className="mt-5 min-h-[44px] rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-7 py-3 text-sm font-bold uppercase tracking-[0.22em] text-white shadow-xl transition hover:scale-[1.03]"
      >
        {won ? "Play Again 💕" : "Try Again"}
      </button>
    </div>
  </div>
)}
    </div>
  );
}