import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CallToAction() {
  return (
    <section className="container py-16 lg:py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 px-6 py-12 text-center text-white shadow-brand sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to make someone&apos;s day?
          </h2>
          <p className="mt-4 text-base leading-7 text-white/90 sm:text-lg">
            Build your page, publish it, and share the link when the moment is right.
          </p>

          {/* /create sends signed-out visitors to login and brings them back afterwards */}
          <Link
            href="/create"
            className="btn btn-lg mt-8 w-full bg-white text-violet-700 shadow-lg hover:bg-violet-50 sm:w-auto"
          >
            Start creating
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
