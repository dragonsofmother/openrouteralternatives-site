export const SITE = {
  name: "OpenRouter Alternatives",
  domain: "openrouteralternatives.eu",
  url: "https://openrouteralternatives.eu",
  tagline: "Compare AI gateways, model routers and multi-provider AI APIs.",
  description:
    "A source-driven comparison of OpenRouter alternatives: AI gateways, model routers and multi-provider AI APIs compared by model coverage, provider diversity, EU jurisdiction, data residency, infrastructure, deployment and company characteristics.",
  locale: "en",
} as const;

/** Public repository. Reused wherever the site points at GitHub. */
export const REPOSITORY_URL = "https://github.com/openrouteralternatives/openrouteralternatives-site";

/**
 * Primary navigation.
 *
 * The homepage is the comparison, so "Compare" is the homepage. Methodology
 * and contribution are sections of that page; the reasoning behind the
 * project has its own route.
 */
export const NAV_LINKS = [
  { href: "/", label: "Compare" },
  { href: "/why", label: "Why" },
  { href: "/#methodology", label: "Methodology" },
  { href: "/#contribute", label: "Contribute" },
] as const;

export const FOOTER_LINKS = [
  { href: "/#compare", label: "Comparison table" },
  { href: "/#methodology", label: "Methodology" },
  { href: "/why", label: "Why this project exists" },
  { href: "/#contribute", label: "How to contribute" },
  { href: REPOSITORY_URL, label: "Source on GitHub", external: true },
] as const;
