import { cn } from "@/lib/utils";
import { chapters, type ChapterId } from "@/content/story";

/** Small editorial chapter marker: "Chapter 01 — The Beginning" */
export function ChapterLabel({ id, className, tone = "dark" }: { id: ChapterId; className?: string; tone?: "dark" | "light" }) {
  const c = chapters.find((x) => x.id === id)!;
  return (
    <div className={cn("eyebrow flex items-center gap-4", tone === "dark" ? "text-wine" : "text-champagne", className)}>
      <span>Chapter {c.number}</span>
      <span className={cn("h-px w-10", tone === "dark" ? "bg-wine/50" : "bg-champagne/60")} />
      <span>{c.title}</span>
    </div>
  );
}
