import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center">
      <Logo />

      <div className="surface mt-8 w-full max-w-md p-8">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The link may be mistyped, or the page may no longer exist.
        </p>

        <Link href="/" className="btn btn-primary mt-6 w-full sm:w-auto">
          Back to home
        </Link>
      </div>
    </main>
  );
}
