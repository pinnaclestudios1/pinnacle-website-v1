import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { DotFace, PyramidArt } from "@/lib/og-art";
import { site } from "@/lib/site";

/**
 * Open Graph / Twitter images for every page, featuring the Dot (brief §11 SEO).
 *   /og?title=Mobile%20Apps&eyebrow=Services
 * Cached for a year at the CDN — the URL changes whenever the title changes.
 */
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const title = (p.get("title") || site.headline).slice(0, 90);
  const eyebrow = (p.get("eyebrow") || site.name).slice(0, 40).toUpperCase();

  const img = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f6f1e7",
        padding: "72px 80px",
        fontFamily: "Georgia, serif",
        color: "#1e1e1e",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 4, color: "#5e5e5c", fontFamily: "monospace" }}>
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: title.length > 40 ? 64 : 80,
            lineHeight: 1.02,
            letterSpacing: -2,
            maxWidth: 680,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            letterSpacing: 6,
            color: "#101216",
            fontFamily: "sans-serif",
            fontWeight: 600,
          }}
        >
          PINNACLE STUDIOS
        </div>
      </div>
      <div
        style={{
          display: "flex",
          position: "relative",
          width: 340,
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <PyramidArt width={320} />
        <div
          style={{
            position: "absolute",
            left: 160 - 36,
            bottom: 252 - 30 - 36 + 18,
            display: "flex",
          }}
        >
          <DotFace size={72} />
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
  img.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return img;
}
