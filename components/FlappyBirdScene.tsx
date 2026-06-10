"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PipePair = {
  id: number;
  x: number;
  gapTop: number;
  gapHeight: number;
  width: number;
  scored: boolean;
};

type Props = {
  // add this new one
  challengeTarget?: number | null;
};

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1600;

const BIRD_X = 230;
const BIRD_SIZE = 68;

const GRAVITY = 1650;
const FLAP_STRENGTH = -520;

const PIPE_SPEED = 255;
const PIPE_WIDTH = 132;
const PIPE_GAP = 700;
const PIPE_DISTANCE = 560;
const GROUND_HEIGHT = 150;
const SAFE_TOP = 24;

function randomGapTop() {
  const min = 180;
  const max = WORLD_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 220;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makePipe(number: number, startX: number): PipePair {
  return {
    id: number,
    x: startX,
    gapTop: randomGapTop(),
    gapHeight: PIPE_GAP,
    width: PIPE_WIDTH,
    scored: false
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(
  aLeft: number,
  aTop: number,
  aRight: number,
  aBottom: number,
  bLeft: number,
  bTop: number,
  bRight: number,
  bBottom: number
) {
  return aRight >= bLeft && aLeft <= bRight && aBottom >= bTop && aTop <= bBottom;
}

export function FlappyBirdScene({
  // add this new one
  challengeTarget = null
}: Props) {
  const [birdY, setBirdY] = useState(WORLD_HEIGHT * 0.42);
  const [velocity, setVelocity] = useState(0);

  const [pipes, setPipes] = useState<PipePair[]>([
    makePipe(1, WORLD_WIDTH + 220),
    makePipe(2, WORLD_WIDTH + 220 + PIPE_DISTANCE),
    makePipe(3, WORLD_WIDTH + 220 + PIPE_DISTANCE * 2)
  ]);

  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // add this new one
  const [missionPassed, setMissionPassed] = useState(false);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const nextPipeNumberRef = useRef(4);
  const velocityRef = useRef(0);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  // add this new one
  useEffect(() => {
    if (
      !missionPassed &&
      challengeTarget !== null &&
      challengeTarget > 0 &&
      score >= challengeTarget
    ) {
      setMissionPassed(true);
      setStarted(false);
      setGameOver(true);
      velocityRef.current = 0;
      setVelocity(0);
    }
  }, [score, challengeTarget, missionPassed]);

  const resetGame = useCallback(() => {
    setBirdY(WORLD_HEIGHT * 0.42);
    setVelocity(0);
    velocityRef.current = 0;
    setScore(0);
    setStarted(false);
    setGameOver(false);

    // add this new one
    setMissionPassed(false);

    setPipes([
      makePipe(1, WORLD_WIDTH + 220),
      makePipe(2, WORLD_WIDTH + 220 + PIPE_DISTANCE),
      makePipe(3, WORLD_WIDTH + 220 + PIPE_DISTANCE * 2)
    ]);

    lastTimeRef.current = null;
    nextPipeNumberRef.current = 4;
  }, []);

  const flap = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }

    setStarted(true);
    velocityRef.current = FLAP_STRENGTH;
    setVelocity(FLAP_STRENGTH);
  }, [gameOver, resetGame]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        flap();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flap]);

  useEffect(() => {
    if (gameOver) return;

    const tick = (timestamp: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp;
      }

      const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.032);
      lastTimeRef.current = timestamp;

      if (started) {
        const nextVelocity = velocityRef.current + GRAVITY * delta;
        velocityRef.current = nextVelocity;
        setVelocity(nextVelocity);

        setBirdY((prev) => prev + nextVelocity * delta);

        setPipes((current) => {
          let next = current
            .map((pipe) => ({
              ...pipe,
              x: pipe.x - PIPE_SPEED * delta
            }))
            .filter((pipe) => pipe.x + pipe.width > -80);

          let passedCount = 0;

          next = next.map((pipe) => {
            if (!pipe.scored && pipe.x + pipe.width < BIRD_X) {
              passedCount += 1;
              return { ...pipe, scored: true };
            }
            return pipe;
          });

          if (passedCount > 0) {
            setScore((prev) => prev + passedCount);
          }

          const rightMostX =
            next.length > 0 ? Math.max(...next.map((pipe) => pipe.x)) : WORLD_WIDTH + 220;

          if (next.length === 0) {
            const nextNumber = nextPipeNumberRef.current;
            nextPipeNumberRef.current += 1;
            next.push(makePipe(nextNumber, WORLD_WIDTH + 220));
          } else if (rightMostX <= WORLD_WIDTH) {
            const nextNumber = nextPipeNumberRef.current;
            nextPipeNumberRef.current += 1;
            next.push(makePipe(nextNumber, rightMostX + PIPE_DISTANCE));
          }

          return next;
        });
      } else {
        setBirdY((prev) =>
          clamp(prev + Math.sin(timestamp / 180) * 0.8, 120, WORLD_HEIGHT - 380)
        );
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [started, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const birdLeft = BIRD_X;
    const birdRight = BIRD_X + BIRD_SIZE;
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_SIZE;

    const hitsBoundary =
      birdTop <= SAFE_TOP || birdBottom >= WORLD_HEIGHT - GROUND_HEIGHT;

    const hitsPipe = pipes.some((pipe) => {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + pipe.width;

      const topPipeTop = 0;
      const topPipeBottom = pipe.gapTop;

      const bottomPipeTop = pipe.gapTop + pipe.gapHeight;
      const bottomPipeBottom = WORLD_HEIGHT - GROUND_HEIGHT;

      const hitsTopPipe = rectsOverlap(
        birdLeft,
        birdTop,
        birdRight,
        birdBottom,
        pipeLeft,
        topPipeTop,
        pipeRight,
        topPipeBottom
      );

      const hitsBottomPipe = rectsOverlap(
        birdLeft,
        birdTop,
        birdRight,
        birdBottom,
        pipeLeft,
        bottomPipeTop,
        pipeRight,
        bottomPipeBottom
      );

      return hitsTopPipe || hitsBottomPipe;
    });

    if (hitsBoundary || hitsPipe) {
      setGameOver(true);
      setStarted(false);
      velocityRef.current = 0;
      setVelocity(0);
    }
  }, [birdY, pipes, gameOver]);

  const birdRotation = useMemo(() => {
    return clamp(velocity * 0.08, -28, 75);
  }, [velocity]);

  const groundPercent = (GROUND_HEIGHT / WORLD_HEIGHT) * 100;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#87CEEB]">
      <style>{`
        @keyframes flappy-float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        /* add this new one */
        @keyframes challenge-pop {
          0% { transform: scale(0.75); opacity: 0; }
          50% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* add this new one */
        @keyframes challenge-glow {
          0%,100% { box-shadow: 0 0 30px rgba(255,255,255,0.18), 0 0 60px rgba(236,72,153,0.18); }
          50% { box-shadow: 0 0 45px rgba(255,255,255,0.32), 0 0 90px rgba(168,85,247,0.28); }
        }
      `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#87CEEB_0%,#87CEEB_72%,#79c126_72%,#79c126_100%)]" />

      <div
        className="absolute inset-x-0 bg-[#5b9949]"
        style={{
          bottom: `${groundPercent * 0.9}%`,
          height: `${groundPercent * 0.8}%`,
          clipPath:
            "polygon(0% 70%, 4% 30%, 7% 55%, 10% 20%, 15% 55%, 18% 35%, 22% 78%, 27% 38%, 31% 62%, 36% 18%, 42% 70%, 47% 26%, 52% 58%, 58% 22%, 63% 74%, 68% 30%, 74% 52%, 80% 16%, 86% 66%, 91% 34%, 96% 56%, 100% 24%, 100% 100%, 0% 100%)"
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 bg-[#79c126]"
        style={{ height: `${groundPercent}%` }}
      />

      <div
        className="absolute inset-x-0 bottom-0 bg-[#67ad22]"
        style={{ height: `${groundPercent * 0.28}%` }}
      />

      <div className="absolute left-[10%] top-[18%] h-16 w-28 rounded-full bg-white/90 blur-[1px]" />
      <div className="absolute left-[15%] top-[20%] h-20 w-20 rounded-full bg-white/90 blur-[1px]" />
      <div className="absolute left-[21%] top-[19%] h-14 w-20 rounded-full bg-white/90 blur-[1px]" />

      <div className="absolute right-[16%] top-[31%] h-16 w-28 rounded-full bg-white/90 blur-[1px]" />
      <div className="absolute right-[11%] top-[33%] h-20 w-20 rounded-full bg-white/90 blur-[1px]" />
      <div className="absolute right-[6%] top-[32%] h-14 w-20 rounded-full bg-white/90 blur-[1px]" />

      <div className="absolute left-1/2 top-5 z-[80] -translate-x-1/2 rounded-full border border-black/10 bg-white/85 px-8 py-4 text-center shadow-lg">
        <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
          Score
        </div>
        <div className="text-4xl font-black text-slate-800">{score}</div>
      </div>

      {/* add this new one */}
      {challengeTarget !== null && challengeTarget > 0 ? (
        <div className="absolute right-5 top-5 z-[80] rounded-2xl border border-black/10 bg-white/85 px-5 py-3 text-center shadow-lg">
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
            Challenge
          </div>
          <div className="text-lg font-black text-slate-800">
            Pass {challengeTarget} pipes
          </div>
        </div>
      ) : null}

      <div className="absolute inset-0">
        {pipes.map((pipe) => {
          const topHeight = pipe.gapTop;
          const bottomY = pipe.gapTop + pipe.gapHeight;
          const bottomHeight = WORLD_HEIGHT - GROUND_HEIGHT - bottomY;

          return (
            <div
              key={pipe.id}
              className="absolute top-0"
              style={{
                left: `${(pipe.x / WORLD_WIDTH) * 100}%`,
                width: `${(pipe.width / WORLD_WIDTH) * 100}%`,
                height: "100%"
              }}
            >
              <div
                className="absolute left-0 top-0 bg-[#2b6f1f]"
                style={{
                  width: "100%",
                  height: `${(topHeight / WORLD_HEIGHT) * 100}%`
                }}
              >
                <div className="absolute inset-y-0 left-[22%] w-[16%] bg-[#1d5415]" />
                <div className="absolute inset-y-0 right-[22%] w-[16%] bg-[#73ad63]" />
                <div className="absolute bottom-0 left-[-10%] h-8 w-[120%] bg-[#1f5b17]" />
                <div className="absolute bottom-[8px] left-[-4%] h-10 w-[108%] bg-[#2d761f]" />
                <div className="absolute bottom-[8px] left-[24%] h-10 w-[52%] bg-[#74af64]" />
              </div>

              <div
                className="absolute left-1/2 z-20 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white/80 bg-[#0f172a]/70 text-lg font-black text-white shadow-lg"
                style={{
                  top: `${((pipe.gapTop + pipe.gapHeight / 2) / WORLD_HEIGHT) * 100}%`
                }}
              >
                {pipe.id}
              </div>

              <div
                className="absolute left-0 bg-[#2b6f1f]"
                style={{
                  bottom: `${groundPercent}%`,
                  width: "100%",
                  height: `${(bottomHeight / WORLD_HEIGHT) * 100}%`
                }}
              >
                <div className="absolute inset-y-0 left-[22%] w-[16%] bg-[#1d5415]" />
                <div className="absolute inset-y-0 right-[22%] w-[16%] bg-[#73ad63]" />
                <div className="absolute left-[-10%] top-0 h-8 w-[120%] bg-[#1f5b17]" />
                <div className="absolute left-[-4%] top-[8px] h-10 w-[108%] bg-[#2d761f]" />
                <div className="absolute left-[24%] top-[8px] h-10 w-[52%] bg-[#74af64]" />
              </div>
            </div>
          );
        })}

        <div
          className="absolute z-[30]"
          style={{
            left: `${(BIRD_X / WORLD_WIDTH) * 100}%`,
            top: `${(birdY / WORLD_HEIGHT) * 100}%`,
            width: `${(BIRD_SIZE / WORLD_WIDTH) * 100}%`,
            aspectRatio: "1 / 1",
            transform: `rotate(${birdRotation}deg)`,
            transformOrigin: "center center"
          }}
        >
          <div
            className="relative h-full w-full"
            style={{ animation: "flappy-float 0.9s ease-in-out infinite" }}
          >
            <div className="absolute inset-[10%] rounded-full bg-[#ffe100]" />
            <div className="absolute left-[58%] top-[28%] h-[36%] w-[34%] rounded-full bg-white" />
            <div className="absolute left-[70%] top-[38%] h-[10%] w-[10%] rounded-full bg-black" />
            <div className="absolute left-[17%] top-[40%] h-[24%] w-[26%] rounded-full bg-[#f6be3c]" />
            <div
              className="absolute left-[88%] top-[44%] h-0 w-0"
              style={{
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "20px solid #d18b2f"
              }}
            />
            <div className="absolute left-[20%] top-[8%] h-[8%] w-[7%] rounded-full bg-[#ffe100]" />
            <div className="absolute left-[28%] top-[4%] h-[10%] w-[7%] rounded-full bg-[#ffe100]" />
          </div>
        </div>
      </div>

      {!started && !gameOver ? (
        <div className="absolute inset-x-0 top-[14%] z-[75] flex justify-center">
          <div className="rounded-full bg-black/25 px-6 py-3 text-sm font-semibold text-white shadow-md backdrop-blur-sm">
            Tap the button to flap and pass through the numbered pipes
          </div>
        </div>
      ) : null}

      {/* add this new one */}
      {missionPassed ? (
        <div className="absolute inset-0 z-[95] flex items-center justify-center bg-black/30">
          <div
            className="w-[min(92vw,760px)] rounded-[2rem] border border-white/20 bg-white/10 px-8 py-12 text-center text-white backdrop-blur-xl"
            style={{
              animation: "challenge-pop 0.6s ease-out, challenge-glow 2.2s ease-in-out infinite"
            }}
          >
            <div className="text-sm font-bold uppercase tracking-[0.5em] text-pink-200">
  Love Challenge Complete
</div>

<div className="mt-4 text-5xl font-black leading-tight md:text-7xl">
  YOU WON
  <br />
  MY HEART
</div>

<div className="mt-5 text-lg font-semibold leading-relaxed text-white/90 md:text-xl">
  You passed every challenge and unlocked a special place in my heart. 💖
</div>

<button
  type="button"
  onClick={resetGame}
  className="mt-8 rounded-full bg-gradient-to-r from-pink-400 to-violet-500 px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-white shadow-xl transition hover:scale-[1.03]"
>
  Play Again 💕
</button>
          </div>
        </div>
      ) : null}

      {/* add this new one */}
      {gameOver && !missionPassed ? (
        <div className="absolute inset-0 z-[85] flex items-center justify-center bg-black/35">
          <div className="w-[min(92vw,460px)] rounded-[2rem] border border-white/20 bg-black/55 p-8 text-center text-white shadow-2xl backdrop-blur-md">
            <div className="text-sm uppercase tracking-[0.35em] text-pink-200">
              Game Over
            </div>
            <div className="mt-3 text-5xl font-black">{score}</div>

            {challengeTarget !== null && challengeTarget > 0 ? (
              <div className="mt-4 text-base font-semibold text-yellow-100">
                TRY AGAIN
              </div>
            ) : null}

            <div className="mt-2 text-sm text-white/80">
              {challengeTarget !== null && challengeTarget > 0
                ? `You passed ${score} pipe${score === 1 ? "" : "s"}. Target: ${challengeTarget}.`
                : `You passed ${score} pipe${score === 1 ? "" : "s"}.`}
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="mt-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-7 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg transition hover:scale-[1.02]"
            >
              Restart
            </button>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-6 z-[90] flex justify-center px-4">
        <button
          type="button"
          onClick={flap}
          className="min-w-[220px] rounded-full border border-black/10 bg-[#efe58b] px-10 py-5 text-2xl font-black uppercase tracking-[0.12em] text-black shadow-[0_12px_0_rgba(0,0,0,0.18)] transition active:translate-y-[2px]"
        >
          FLAP
        </button>
      </div>
    </div>
  );
}