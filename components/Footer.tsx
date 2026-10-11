import Link from "next/link";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" }
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/60 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 text-sm text-slate-600">
      <div className="container">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="leading-6">Personalized memory pages with shareable links.</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-2 gap-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="-mx-1 flex min-h-[44px] items-center rounded-full px-4 font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-950 md:mx-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200/70 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} LoveLink Studio</p>
          <p>Built with Next.js, Prisma, PostgreSQL, Cloudinary, Tailwind, and Framer Motion.</p>
        </div>
      </div>
    </footer>
  );
}
