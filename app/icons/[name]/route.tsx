import { ImageResponse } from "next/og";
import { DotFace } from "@/lib/og-art";

/**
 * PWA / manifest icons: /icons/192.png, /icons/512.png, /icons/maskable-512.png.
 * Maskable icons keep the Dot inside the safe zone (inner 80%).
 */
export const dynamic = "force-static";

const VARIANTS: Record<string, { size: number; dot: number }> = {
  "192.png": { size: 192, dot: 140 },
  "512.png": { size: 512, dot: 372 },
  "maskable-512.png": { size: 512, dot: 280 },
};

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((name) => ({ name }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const v = VARIANTS[name];
  if (!v) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f1e7",
      }}
    >
      <DotFace size={v.dot} />
    </div>,
    { width: v.size, height: v.size },
  );
}
