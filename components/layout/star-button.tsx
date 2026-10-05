import { Star } from "lucide-react";
import { REPOSITORY_URL } from "@/data/site";
import { cn } from "@/lib/utils";

/** "star": a plain link to the repository, where the starring happens. */
export function StarButton({ className }: { className?: string }) {
  return (
    <a
      href={REPOSITORY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Star this project on GitHub"
      className={cn(
        "items-center gap-1.5 border border-line-strong px-2.5 py-1 text-[12.5px] text-ink-muted transition-colors hover:bg-subtle hover:text-ink",
        className,
      )}
    >
      <Star aria-hidden="true" className="size-3.5" />
      star
    </a>
  );
}
