import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/data/site";
import { allGateways } from "@/lib/gateway";

/**
 * The preview card shown when a link to the site is shared: in chat, on
 * social networks, in link unfurls. Rendered once at build time by
 * `app/opengraph-image.tsx` and `app/twitter-image.tsx`, in the site's dark
 * terminal palette, with six gateway marks taken from `public/logos`.
 */

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };
export const SOCIAL_IMAGE_ALT =
  "OpenRouter Alternatives: compare AI gateways, model routers and multi-provider AI APIs";

/** Marks on the card, in the order of the scatter below. Each must carry a logo. */
const FEATURED = ["eden-ai", "kong-ai-gateway", "litellm", "helicone", "respan", "truefoundry"];

/**
 * A loose cloud rather than a row: six equal tiles at hand-placed offsets
 * inside a 1080×290 band, each at a different height and tilted a few
 * degrees, so the marks read as a handful picked at random with no one of
 * them favoured. Positions are fixed so the card renders the same on every
 * build; none of the tiles overlap, labels included.
 */
const TILE = 124;
const LABEL = 16;
const SCATTER = [
  { x: 30, y: 40, tilt: -4 },
  { x: 230, y: 0, tilt: 3 },
  { x: 420, y: 82, tilt: -2 },
  { x: 620, y: 16, tilt: 5 },
  { x: 790, y: 118, tilt: -3 },
  { x: 950, y: 30, tilt: 2 },
];

const INK = "#f2f7f3";
const TEXT = "#d7e0d9";
const MUTED = "#8a978e";
const LINE = "#2b3d32";
const ACCENT = "#7ff0a2";
const CANVAS = "#0b0f0d";

async function dataUri(relativePath: string): Promise<string> {
  const file = await readFile(path.join(process.cwd(), relativePath));
  const ext = path.extname(relativePath).slice(1).toLowerCase();
  const mime = ext === "svg" ? "image/svg+xml" : `image/${ext}`;
  return `data:${mime};base64,${file.toString("base64")}`;
}

async function fontData(file: string): Promise<ArrayBuffer> {
  const buf = await readFile(path.join(process.cwd(), "app/fonts", file));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function marks(slugs: string[]) {
  const gateways = allGateways();
  return Promise.all(
    slugs.map(async (slug) => {
      const gateway = gateways.find((entry) => entry.slug === slug);
      if (!gateway?.logo) throw new Error(`Social image: "${slug}" is not in the dataset or has no logo`);
      return { name: gateway.name, src: await dataUri(`public${gateway.logo}`) };
    }),
  );
}

function Tile({
  name,
  src,
  box,
  label,
  labelColor,
}: {
  name: string;
  src: string;
  box: number;
  label: number;
  labelColor: string;
}) {
  const inset = Math.round(box * 0.12);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: box,
          height: box,
          padding: inset,
          background: "#ffffff",
          border: `1px solid ${LINE}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={box - inset * 2} height={box - inset * 2} style={{ objectFit: "contain" }} />
      </div>
      <div style={{ display: "flex", fontSize: label, color: labelColor, whiteSpace: "nowrap" }}>{name}</div>
    </div>
  );
}

export async function renderSocialImage(): Promise<ImageResponse> {
  const [featured, regular, bold] = await Promise.all([
    marks(FEATURED),
    fontData("JetBrainsMono-Regular.ttf"),
    fontData("JetBrainsMono-Bold.ttf"),
  ]);
  const placed = featured.map((mark, index) => ({ ...mark, ...SCATTER[index] }));
  const count = allGateways().length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 60px 44px",
          background: CANVAS,
          color: TEXT,
          fontFamily: "JetBrains Mono",
          border: `1px solid ${LINE}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", fontSize: 22, color: MUTED }}>
            ~/openrouter-alternatives $ ora compare --all
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 58, fontWeight: 700, color: ACCENT }}>&gt;</div>
            <div style={{ display: "flex", fontSize: 58, fontWeight: 700, color: INK, letterSpacing: -1 }}>
              {SITE.name}
            </div>
            <div style={{ display: "flex", width: 22, height: 46, background: ACCENT, marginTop: 6 }} />
          </div>
          <div style={{ display: "flex", fontSize: 25, color: TEXT }}>
            compare AI gateways, model routers and multi-provider AI APIs
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", width: "100%", height: 290 }}>
          {placed.map((mark) => (
            <div
              key={mark.name}
              style={{
                display: "flex",
                position: "absolute",
                left: mark.x,
                top: mark.y,
                transform: `rotate(${mark.tilt}deg)`,
              }}
            >
              <Tile name={mark.name} src={mark.src} box={TILE} label={LABEL} labelColor={TEXT} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19, color: MUTED }}>
          <div style={{ display: "flex" }}>
            {SITE.domain} · {count} gateways · measured, sourced, no score
          </div>
          <div style={{ display: "flex" }}>exit 0</div>
        </div>
      </div>
    ),
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { name: "JetBrains Mono", data: regular, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
