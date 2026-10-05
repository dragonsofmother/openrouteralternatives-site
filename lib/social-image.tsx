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

/** Marks shown large, then small. Slugs from the dataset; each must carry a logo. */
const FEATURED_LARGE = ["eden-ai", "kong-ai-gateway", "litellm"];
const FEATURED_SMALL = ["helicone", "respan", "truefoundry"];

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
  const [large, small, regular, bold] = await Promise.all([
    marks(FEATURED_LARGE),
    marks(FEATURED_SMALL),
    fontData("JetBrainsMono-Regular.ttf"),
    fontData("JetBrainsMono-Bold.ttf"),
  ]);
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

        <div style={{ display: "flex", alignItems: "flex-end", gap: 30 }}>
          {large.map((mark) => (
            <Tile key={mark.name} name={mark.name} src={mark.src} box={150} label={19} labelColor={TEXT} />
          ))}
          <div style={{ display: "flex", width: 0, height: 170, borderLeft: `1px dashed ${LINE}`, margin: "0 10px 14px" }} />
          {small.map((mark) => (
            <Tile key={mark.name} name={mark.name} src={mark.src} box={92} label={15} labelColor={MUTED} />
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
