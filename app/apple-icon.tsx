import { ImageResponse } from "next/og";
import { DotFace } from "@/lib/og-art";

/** Apple touch icon: the Dot on cream (brief §7: app icons with the Dot). */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
      <DotFace size={124} />
    </div>,
    size,
  );
}
