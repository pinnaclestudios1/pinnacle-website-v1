/**
 * Shared artwork for generated images (Open Graph cards, app icons): the pyramid
 * line-work and the Dot with eyes. Satori (next/og) supports inline SVG and flexbox only.
 */
export function DotFace({ size }: { size: number }) {
  const eyeW = size * 0.13;
  const eyeH = size * 0.19;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        background: "#ff5b27",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.2,
        paddingBottom: size * 0.08,
      }}
    >
      <div style={{ width: eyeW, height: eyeH, borderRadius: 9999, background: "#1e1e1e" }} />
      <div style={{ width: eyeW, height: eyeH, borderRadius: 9999, background: "#1e1e1e" }} />
    </div>
  );
}

/** Pyramid outline + inner lines + nodes, apex left empty for the Dot. */
export function PyramidArt({ width }: { width: number }) {
  const h = (width * 252) / 321.32;
  return (
    <svg width={width} height={h} viewBox="0 0 321.32 252" fill="none">
      <path
        d="M25.57 226.52L160.76 29.23L295.94 226.52H25.57Z"
        stroke="#777775"
        strokeWidth="9.79"
      />
      <path
        d="M160.76 29.23V138.84M160.76 138.84L25.57 226.52M160.76 138.84L295.94 226.52"
        stroke="#777775"
        strokeWidth="9.79"
      />
      <circle cx="25.28" cy="224.27" r="23.65" fill="#353535" />
      <circle cx="286.25" cy="224.27" r="23.65" fill="#353535" />
      <circle cx="160.76" cy="138.84" r="20.09" fill="#353535" />
    </svg>
  );
}
