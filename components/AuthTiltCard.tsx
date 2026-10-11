"use client";

import Link from "next/link";
import { ReactNode, useRef, useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { Logo } from "@/components/Logo";

type AuthTiltCardProps = {
  mode: "login" | "signup";
  title: string;
  subtitle: string;
  imageTitle: string;
  imageSubtitle: string;
  children: ReactNode;
};

export function AuthTiltCard({
  mode,
  title,
  subtitle,
  imageTitle,
  imageSubtitle,
  children
}: AuthTiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [eyeMove, setEyeMove] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    // Tilt only for a real mouse; a tap on a touch screen would leave the card skewed.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const middleX = rect.width / 2;
    const middleY = rect.height / 2;

    const rotateY = ((x - middleX) / middleX) * 6;
    const rotateX = -((y - middleY) / middleY) * 6;

    const eyeX = Math.max(-10, Math.min(10, ((x - middleX) / middleX) * 8));
    const eyeY = Math.max(-8, Math.min(8, ((y - middleY) / middleY) * 6));

    setEyeMove({ x: eyeX, y: eyeY });

    card.style.transform = `
      perspective(1400px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.012, 1.012, 1.012)
    `;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    setEyeMove({ x: 0, y: 0 });

    card.style.transform = `
      perspective(1400px)
      rotateX(0deg)
      rotateY(0deg)
      scale3d(1, 1, 1)
    `;
  };

  const pupilTransform = `translate(calc(-50% + ${
    eyeMove.x * 0.45
  }px), calc(-50% + ${eyeMove.y * 0.45}px))`;

  const shineTransform = `translate(calc(-50% + ${
    4 + eyeMove.x * 0.16
  }px), calc(-50% + ${-4 + eyeMove.y * 0.16}px))`;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 text-slate-950 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(221,214,254,0.85),transparent_32%),linear-gradient(135deg,#fdf2f8,#f8fbff_45%,#e0e7ff)]" />

      <div className="pointer-events-none absolute left-[-120px] top-[-100px] h-80 w-80 rounded-full bg-pink-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-100px] h-96 w-96 rounded-full bg-violet-200/60 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
          <Link
            href="/"
            aria-label="Back to landing page"
            className="btn btn-secondary bg-white/80 px-4 backdrop-blur-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
              <span className="hidden sm:inline">Back to </span>Home
            </span>
          </Link>

          <Logo tagline="Romantic animated pages" className="hidden sm:inline-flex" />

          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className="btn btn-secondary bg-white/80 backdrop-blur-xl"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </div>

        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="grid overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/80 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-transform duration-200 ease-out sm:rounded-[2rem] lg:grid-cols-[1fr_1fr]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="relative hidden min-h-[640px] overflow-hidden bg-gradient-to-br from-violet-100 via-white to-sky-50 p-8 lg:block">
            <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-sky-200/60 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />

            <div className="relative flex h-full flex-col items-center justify-center rounded-[1.7rem] border border-white/80 bg-white/35 p-8 shadow-inner backdrop-blur-md">
              <div
                className="absolute left-10 top-20 text-4xl transition-transform duration-150"
                style={{
                  transform: `translate(${eyeMove.x * -0.6}px, ${
                    eyeMove.y * -0.6
                  }px)`
                }}
              >
                ✨
              </div>

              <div
                className="absolute right-14 top-24 text-5xl transition-transform duration-150"
                style={{
                  transform: `translate(${eyeMove.x * 0.7}px, ${
                    eyeMove.y * 0.7
                  }px)`
                }}
              >
                💖
              </div>

              <div
                className="absolute left-16 bottom-28 text-4xl transition-transform duration-150"
                style={{
                  transform: `translate(${eyeMove.x * -0.8}px, ${
                    eyeMove.y * -0.8
                  }px)`
                }}
              >
                ☁️
              </div>

              <div className="relative mb-8 flex h-[340px] w-[320px] items-center justify-center">
                <div className="absolute bottom-2 h-16 w-48 rounded-full bg-slate-900/10 blur-2xl" />

                <div
                  className="relative h-[285px] w-[235px] transition-transform duration-150"
                  style={{
                    transform: `translate(${eyeMove.x * 0.35}px, ${
                      eyeMove.y * 0.25
                    }px)`
                  }}
                >
                  <div className="absolute left-[18px] top-[62px] h-16 w-16 rounded-full bg-sky-300" />
                  <div className="absolute right-[18px] top-[62px] h-16 w-16 rounded-full bg-sky-300" />

                  <div className="absolute left-1/2 top-[28px] h-[230px] w-[210px] -translate-x-1/2 rounded-[48%] bg-white shadow-[inset_0_-10px_0_rgba(226,232,240,0.9),0_20px_50px_rgba(148,163,184,0.18)]" />

                  <div className="absolute left-[42px] top-[22px] h-12 w-8 rotate-[-18deg] rounded-t-full rounded-b-[18px] bg-white" />
                  <div className="absolute left-[66px] top-[8px] h-16 w-10 rotate-[-8deg] rounded-t-full rounded-b-[18px] bg-white" />
                  <div className="absolute left-[98px] top-[0px] h-[72px] w-10 rounded-t-full rounded-b-[18px] bg-white" />
                  <div className="absolute left-[126px] top-[10px] h-16 w-10 rotate-[8deg] rounded-t-full rounded-b-[18px] bg-white" />
                  <div className="absolute left-[152px] top-[24px] h-12 w-8 rotate-[18deg] rounded-t-full rounded-b-[18px] bg-white" />

                  <div className="absolute left-1/2 top-[58px] h-[106px] w-[138px] -translate-x-1/2 rounded-[44px] bg-sky-200" />

                  <div className="absolute left-[66px] top-[90px] h-[40px] w-[40px] rounded-full bg-white shadow-inner">
                    <div
                      className="absolute left-1/2 top-1/2 h-[20px] w-[20px] rounded-full bg-slate-950 transition-transform duration-75"
                      style={{
                        transform: pupilTransform
                      }}
                    >
                      <div
                        className="absolute h-[6px] w-[6px] rounded-full bg-white transition-transform duration-75"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: shineTransform
                        }}
                      />
                    </div>
                  </div>

                  <div className="absolute right-[66px] top-[90px] h-[40px] w-[40px] rounded-full bg-white shadow-inner">
                    <div
                      className="absolute left-1/2 top-1/2 h-[20px] w-[20px] rounded-full bg-slate-950 transition-transform duration-75"
                      style={{
                        transform: pupilTransform
                      }}
                    >
                      <div
                        className="absolute h-[6px] w-[6px] rounded-full bg-white transition-transform duration-75"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: shineTransform
                        }}
                      />
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-[136px] h-[10px] w-[26px] -translate-x-1/2 rounded-b-full border-b-[4px] border-slate-700" />

                  <div className="absolute left-[18px] top-[142px] h-[76px] w-[42px] rotate-[18deg] rounded-full bg-white" />

                  <div
                    className="absolute right-[10px] top-[120px] h-[92px] w-[44px] rounded-full bg-white transition-transform duration-150"
                    style={{
                      transform: `rotate(${18 + eyeMove.x * 0.25}deg)`
                    }}
                  />

                  <div className="absolute left-[8px] top-[192px] h-[34px] w-[34px] rounded-full bg-sky-300" />
                  <div className="absolute right-[0px] top-[112px] h-[38px] w-[38px] rounded-full bg-sky-300" />

                  <div className="absolute left-[56px] top-[226px] h-[56px] w-[40px] rounded-full bg-white" />
                  <div className="absolute right-[56px] top-[226px] h-[56px] w-[40px] rounded-full bg-white" />

                  <div className="absolute left-[45px] top-[252px] h-[28px] w-[46px] rounded-full bg-sky-300" />
                  <div className="absolute right-[45px] top-[252px] h-[28px] w-[46px] rounded-full bg-sky-300" />
                </div>
              </div>

              <div
                className="w-full max-w-[470px] rounded-[1.7rem] border border-white/80 bg-white/75 p-7 text-center shadow-sm backdrop-blur-md transition-transform duration-150"
                style={{
                  transform: `translate(${eyeMove.x * 0.25}px, ${
                    eyeMove.y * 0.25
                  }px)`
                }}
              >
                <h2 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-slate-950">
                  {imageTitle}
                </h2>

                <p className="mt-5 text-base font-semibold leading-8 text-slate-600">
                  {imageSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-8 sm:px-10 sm:py-10 lg:min-h-[640px]">
            <div className="w-full max-w-md">
              <div className="mb-6 text-center sm:mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-brand">
                  <Heart className="h-6 w-6" />
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h1>

                <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-slate-600">
                  {subtitle}
                </p>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}