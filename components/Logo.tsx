import Link from "next/link";
import { Heart } from "lucide-react";

type LogoProps = {
  href?: string;
  tagline?: string;
  compact?: boolean;
  className?: string;
};

export function Logo({ href = "/", tagline, compact = false, className = "" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="LoveLink Studio home"
      className={`inline-flex min-w-0 items-center gap-2.5 text-slate-950 ${className}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-brand">
        <Heart className="h-5 w-5" />
      </span>

      <span className={`min-w-0 ${compact ? "hidden sm:block" : ""}`}>
        <span className="block truncate text-base font-extrabold leading-tight tracking-tight">
          LoveLink Studio
        </span>
        {tagline ? (
          <span className="hidden truncate text-xs font-medium text-slate-500 sm:block">
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
