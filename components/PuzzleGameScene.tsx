"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  imageUrl?: string;
  timeLimitSeconds?: number;
};

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
  timeLimitSeconds = 60
}: Props) {
  const [tiles, setTiles] = useState<number[]>(createSolvedTiles());
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);

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
  };

  const tileSizeStyles = useMemo(
    () => ({
      backgroundSize: `${COLS * 100}% ${ROWS * 100}%`
    }),
    []
  );

  if (!imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-center text-white">
        <div className="rounded-[2rem] border border-white/10 bg-black/30 px-8 py-6 backdrop-blur-md">
          <div className="text-sm uppercase tracking-[0.35em] text-cyan-200">Puzzle Game</div>
          <div className="mt-3 text-2xl font-bold">Upload an image for Background 4</div>
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

      {/* add this new one */}
      <div className="absolute right-4 top-4 z-[90] flex items-center gap-3 rounded-full border border-white/10 bg-white/90 px-5 py-3 text-slate-900 shadow-xl md:right-6">
        <div className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">
          Time Left
        </div>
        <div className="text-3xl font-black leading-none">{timeLeft}s</div>
      </div>

      <div className="absolute inset-0 overflow-y-auto px-4 pb-6 pt-24 md:px-6 md:pb-8 md:pt-28">
        <div className="mx-auto grid max-w-[1180px] gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">
                  Sliding Puzzle
                </div>
                <div className="mt-1 text-2xl font-black md:text-3xl">
                  Solve to Unlock
                </div>
              </div>

              <button
                type="button"
                onClick={resetGame}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg"
              >
                Restart
              </button>
            </div>

            <div className="mx-auto w-full max-w-[620px]">
              <div
                className="grid gap-2 rounded-[1.5rem] bg-black/20 p-3"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`
                }}
              >
                {tiles.map((tileValue, slotIndex) => {
                  const emptyIndex = tiles.indexOf(EMPTY_TILE);
                  const canMove = isAdjacent(slotIndex, emptyIndex);

                  if (tileValue === EMPTY_TILE) {
                    return (
                      <div
                        key={`empty-${slotIndex}`}
                        className="aspect-square rounded-2xl border border-dashed border-white/20 bg-white/5"
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
                      className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
                        canMove
                          ? "border-cyan-300/60 hover:border-cyan-300 hover:scale-[1.02]"
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
            </div>

            <div className="mt-4 text-sm text-white/75">
              Tip: Click a tile next to the empty space to slide it.
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-2xl backdrop-blur-xl">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-pink-200">
              Original Photo
            </div>

            <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
              <img
                src={imageUrl}
                alt="Original puzzle reference"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white">Rules</div>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                <li>• This is a 3 x 3 sliding puzzle.</li>
                <li>• One square stays empty.</li>
                <li>• Click a tile next to the empty square to move it.</li>
                <li>• Complete the image before time runs out.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {(won || lost) && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
          <div
            className="w-full max-w-[720px] rounded-[2rem] border border-white/15 bg-white/10 px-8 py-10 text-center text-white shadow-2xl backdrop-blur-2xl"
            style={{ animation: "puzzle-pop 0.35s ease-out" }}
          >
            <div className="text-sm uppercase tracking-[0.35em] text-cyan-200">
              Sliding Puzzle
            </div>

            <div className="mt-4 text-4xl font-black md:text-6xl">
              {won ? "YOU SOLVED IT!" : "TIME’S UP!"}
            </div>

            <div className="mt-4 text-base text-white/85">
              {won
                ? "Great job. You completed the puzzle successfully."
                : "Try again and complete the image before time runs out."}
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="mt-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.22em] text-white shadow-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}