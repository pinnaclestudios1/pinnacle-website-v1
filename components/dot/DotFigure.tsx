/**
 * The Dot's artwork (brief §3 Design rules): a perfect orange circle, two simple
 * eyes, an optional tiny mouth for big emotions, a soft peach glow and a ground
 * shadow. Tiny limbs appear only with props (map, flag).
 *
 * Coordinates: body radius 40 centred on (0,0) in a -50..50 box. The box is
 * 1.25× the body diameter; overflow is visible so hops, confetti and props can
 * leave it. Every animated part is tagged data-part for the actor.
 *
 * Only orange, charcoal, cream and grey are used — the Dot stays the only loud thing.
 */

const ORANGE = "var(--pn-orange)";
const INK = "#1e1e1e";
const CREAM = "#fbf8f2";
const GREY = "#777775";
const CAP = "#353535";

const EYES = [
  { side: "l", x: -14, y: -5 },
  { side: "r", x: 14, y: -5 },
] as const;

// Deterministic confetti so server and client markup match.
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  shape: i % 2 === 0 ? "rect" : "circle",
  cream: i % 3 === 0,
}));

export function DotFigure({ uid, interactive = false }: { uid: string; interactive?: boolean }) {
  const halo = `${uid}-halo`;
  const shadow = `${uid}-shadow`;

  return (
    <svg
      viewBox="-50 -50 100 100"
      width="100%"
      height="100%"
      overflow="visible"
      aria-hidden
      focusable={false}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={halo}>
          <stop offset="0" stopColor="var(--pn-peach)" stopOpacity="0.95" />
          <stop offset="0.62" stopColor="var(--pn-peach)" stopOpacity="0.4" />
          <stop offset="1" stopColor="var(--pn-peach)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={shadow}>
          <stop offset="0" stopColor={INK} stopOpacity="0.22" />
          <stop offset="1" stopColor={INK} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse data-part="shadow" cx="0" cy="45" rx="30" ry="5" fill={`url(#${shadow})`} />

      <g data-part="pos">
        <circle data-part="halo" r="54" fill={`url(#${halo})`} opacity="0.75" />
        <g data-part="squash">
          <g data-part="rot">
            {/* Flag (summit): tiny arm + pole, behind the body */}
            <g data-part="acc-flag" opacity="0">
              <path d="M46 -48 L46 -4" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M46 -48 L68 -41 L46 -34 Z" fill={CREAM} stroke={GREY} strokeWidth="1" />
              <path
                d="M36 -6 Q43 -9 46 -16"
                stroke={INK}
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            <circle
              data-part="body"
              r="40"
              fill={ORANGE}
              style={{
                pointerEvents: interactive ? "auto" : "none",
                cursor: interactive ? "pointer" : undefined,
              }}
            />

            <g data-part="face">
              <g data-part="gaze">
                {EYES.map((e) => (
                  <g key={e.side}>
                    <g data-part="eye-open">
                      <ellipse cx={e.x} cy={e.y} rx="5.2" ry="7.5" fill={INK} />
                      <circle cx={e.x + 1.8} cy={e.y - 3} r="1.8" fill={CREAM} />
                    </g>
                    <path
                      data-part="eye-closed"
                      d={`M${e.x - 6} ${e.y + 1} Q${e.x} ${e.y + 6} ${e.x + 6} ${e.y + 1}`}
                      stroke={INK}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0"
                    />
                    <path
                      data-part="eye-happy"
                      d={`M${e.x - 6} ${e.y + 3} Q${e.x} ${e.y - 6} ${e.x + 6} ${e.y + 3}`}
                      stroke={INK}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0"
                    />
                    <path
                      data-part="eye-spiral"
                      d={`M${e.x} ${e.y} a1.5 1.5 0 1 1 3 0 a3 3 0 1 1 -6 0 a4.5 4.5 0 1 1 9 0 a6 6 0 1 1 -12 0`}
                      stroke={INK}
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0"
                    />
                  </g>
                ))}
                <path
                  data-part="mouth-smile"
                  d="M-7 12 Q0 19 7 12"
                  stroke={INK}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0"
                />
                <ellipse
                  data-part="mouth-o"
                  cx="0"
                  cy="15"
                  rx="3.4"
                  ry="4.4"
                  fill={INK}
                  opacity="0"
                />
                <path
                  data-part="mouth-worry"
                  d="M-6 16 Q0 11.5 6 16"
                  stroke={INK}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0"
                />
              </g>
            </g>

            {/* Sunglasses ("pinnacle" easter egg) */}
            <g data-part="acc-sunglasses" opacity="0">
              <path
                d="M-24 -9 L-38 -13 M24 -9 L38 -13"
                stroke={INK}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="-24" y="-13" width="18" height="12" rx="4.5" fill={INK} />
              <rect x="6" y="-13" width="18" height="12" rx="4.5" fill={INK} />
              <path d="M-6 -8 Q0 -11.5 6 -8" stroke={INK} strokeWidth="2" fill="none" />
              <path
                d="M-20 -10 L-15 -10 M10 -10 L15 -10"
                stroke={CREAM}
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>

            {/* Nightcap (after 10pm) */}
            <g data-part="acc-nightcap" opacity="0">
              <path
                d="M-33 -22 Q-26 -52 4 -55 Q34 -56 45 -15 Q36 -35 23 -31 Q-4 -37 -33 -22 Z"
                fill={CAP}
              />
              <path
                d="M-35 -21 Q-4 -39 28 -30"
                stroke={CREAM}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="45" cy="-14" r="5.5" fill={CREAM} stroke={GREY} strokeWidth="0.8" />
            </g>

            {/* Map (lost) — tiny arms holding it */}
            <g data-part="acc-map" opacity="0">
              <path
                d="M-35 13 Q-29 25 -17 25 M35 13 Q29 25 17 25"
                stroke={INK}
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
              <rect
                x="-19"
                y="17"
                width="38"
                height="24"
                rx="1.5"
                fill={CREAM}
                stroke={GREY}
                strokeWidth="1"
              />
              <path d="M-6.3 17 V41 M6.3 17 V41" stroke={GREY} strokeWidth="0.7" />
              <path
                d="M-14 35 Q-7 24 0 31 T13 23"
                stroke={INK}
                strokeWidth="1"
                strokeDasharray="2 2"
                fill="none"
              />
              <path
                d="M11 21 l4 4 m0 -4 l-4 4"
                stroke={INK}
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>

        {/* Sleepy z's */}
        <g fontFamily="var(--font-mono), monospace" fontWeight="600" fill={GREY}>
          <text data-part="z" x="28" y="-38" fontSize="10" opacity="0">
            z
          </text>
          <text data-part="z" x="37" y="-50" fontSize="12" opacity="0">
            z
          </text>
          <text data-part="z" x="46" y="-64" fontSize="15" opacity="0">
            z
          </text>
        </g>
      </g>

      {/* Celebration confetti, orange and cream (outside "pos" so it doesn't ride the jump) */}
      <g data-part="confetti-group">
        {CONFETTI.map((c, i) =>
          c.shape === "rect" ? (
            <rect
              key={i}
              data-part="confetti"
              x="-2"
              y="-3.5"
              width="4"
              height="7"
              rx="1"
              fill={c.cream ? CREAM : ORANGE}
              stroke={c.cream ? GREY : "none"}
              strokeWidth="0.5"
              opacity="0"
            />
          ) : (
            <circle
              key={i}
              data-part="confetti"
              r="2.4"
              fill={c.cream ? CREAM : ORANGE}
              stroke={c.cream ? GREY : "none"}
              strokeWidth="0.5"
              opacity="0"
            />
          ),
        )}
      </g>
    </svg>
  );
}
