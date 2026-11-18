import { ImageResponse } from "next/og";

/** The Dot as a PNG for email signatures (email clients don't render SVG reliably). */
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: 999,
          background: "#ff5b27",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          paddingBottom: 10,
        }}
      >
        <div style={{ width: 13, height: 19, borderRadius: 999, background: "#1e1e1e" }} />
        <div style={{ width: 13, height: 19, borderRadius: 999, background: "#1e1e1e" }} />
      </div>
    </div>,
    { width: 120, height: 120 },
  );
}
