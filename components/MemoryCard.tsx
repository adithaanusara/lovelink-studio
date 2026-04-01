import Link from "next/link";
import { formatDate, getThemeClasses } from "@/lib/utils";

type MemoryCardProps = {
  slug: string;
  title: string;
  recipient: string;
  sender: string;
  occasion: string;
  coverImage: string;
  theme: string;
  eventDate?: string | null;
};

export function MemoryCard({
  slug,
  title,
  recipient,
  sender,
  occasion,
  coverImage,
  theme,
  eventDate
}: MemoryCardProps) {
  return (
    <Link href={`/p/${slug}`} className="group block">
      <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${getThemeClasses(theme)} p-3 transition duration-300 hover:-translate-y-1`}>
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
          <img
            src={coverImage}
            alt={title}
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300">
            <span>{occasion}</span>
            <span>{formatDate(eventDate)}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-200">
              For {recipient} • By {sender}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
