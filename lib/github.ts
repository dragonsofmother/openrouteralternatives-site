import { REPOSITORY_URL } from "@/data/site";

/** "owner/repo" taken from the configured repository URL. */
const REPO = new URL(REPOSITORY_URL).pathname.replace(/^\/+|\/+$/g, "");

/**
 * Star count of the public repository, read once at build time.
 *
 * The site has no runtime data fetching: this runs while the page is
 * prerendered and the value is baked into the HTML until the next build. Any
 * failure (offline build, rate limit, API change) yields null and the button
 * renders without a count. GITHUB_TOKEN is optional and only lifts GitHub's
 * unauthenticated rate limit.
 */
export async function fetchStarCount(): Promise<number | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "openrouteralternatives.eu",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { stargazers_count?: unknown };
    return typeof body.stargazers_count === "number" ? body.stargazers_count : null;
  } catch {
    return null;
  }
}
