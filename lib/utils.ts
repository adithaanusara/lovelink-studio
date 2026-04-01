import slugify from "slugify";

export function createSlug(name: string) {
  return slugify(name, { lower: true, strict: true, trim: true });
}

export function getThemeClasses(theme: string) {
  const themes: Record<string, string> = {
    romantic: "from-pink-500/25 via-rose-400/10 to-purple-500/20",
    dreamy: "from-fuchsia-500/20 via-violet-400/10 to-sky-500/20",
    elegant: "from-amber-300/15 via-white/5 to-rose-400/15",
    cute: "from-yellow-300/20 via-pink-300/10 to-red-300/20"
  };

  return themes[theme] ?? themes.romantic;
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}
