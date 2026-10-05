import { Star } from "lucide-react";
import { REPOSITORY_URL } from "@/data/site";
import { formatCompactCount } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * "Star on GitHub" with the repository's star count beside it.
 *
 * The count comes from `fetchStarCount` at build time, so the page stays
 * static. When it could not be read the button simply omits the count rather
 * than showing a zero it cannot stand behind.
 */
export function StarButton({ stars, className }: { stars: number | null; className?: string }) {
  const label =
    stars === null
      ? "Star this project on GitHub"
      : `Star this project on GitHub. ${stars} ${stars === 1 ? "star" : "stars"} so far`;

  return (
    <a
      href={REPOSITORY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "items-stretch overflow-hidden rounded-lg border border-line bg-surface text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5">
        <Star aria-hidden="true" className="size-3.5" />
        Star
      </span>
      {stars !== null ? (
        <span className="tnum inline-flex items-center border-l border-line bg-subtle px-2.5 font-medium text-ink">
          {formatCompactCount(stars)}
        </span>
      ) : null}
    </a>
  );
}
