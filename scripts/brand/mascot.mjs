/**
 * The Dot — pose pack for reels and social (brand use outside the website).
 * Every pose is built from the same artwork as components/dot/DotFigure.tsx (body r40,
 * eyes, mouths, props), with the brand colours baked in so the files stand alone.
 *
 *   npm run brand:mascot
 *
 * Output (brand/mascot/):
 *   svg/<pose>.svg        transparent, square 1:1, same framing for every pose
 *   svg/flat/<pose>.svg   no glow and no ground shadow (for compositing / animating)
 *   png/<pose>.png        2048×2048 transparent (CapCut, Instagram, Premiere…)
 *   png/flat/<pose>.png
 *   index.html            contact sheet on cream and on night
 *   contact-sheet.png
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const OUT = path.resolve("brand/mascot");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const C = {
  orange: "#ff5b27",
  peach: "#ffd9c6",
  ink: "#1e1e1e",
  cream: "#fbf8f2",
  grey: "#777775",
  cap: "#353535",
  night: "#181715",
  bg: "#f6f1e7",
};

/* ------------------------------------------------------------------ parts */

const EYES = [-14, 14];
const EY = -5;

const eyes = {
  open: ({ gx = 0, gy = 0, s = 1 } = {}) =>
    EYES.map(
      (x) =>
        `<ellipse cx="${x + gx}" cy="${EY + gy}" rx="${5.2 * s}" ry="${7.5 * s}" fill="${C.ink}"/>` +
        `<circle cx="${x + gx + 1.8 * s}" cy="${EY + gy - 3 * s}" r="${1.8 * s}" fill="${C.cream}"/>`,
    ).join(""),
  closed: () =>
    EYES.map(
      (x) =>
        `<path d="M${x - 6} ${EY + 1} Q${x} ${EY + 6} ${x + 6} ${EY + 1}" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
    ).join(""),
  happy: () =>
    EYES.map(
      (x) =>
        `<path d="M${x - 6} ${EY + 3} Q${x} ${EY - 6} ${x + 6} ${EY + 3}" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
    ).join(""),
  spiral: () =>
    EYES.map(
      (x) =>
        `<path d="M${x} ${EY} a1.5 1.5 0 1 1 3 0 a3 3 0 1 1 -6 0 a4.5 4.5 0 1 1 9 0 a6 6 0 1 1 -12 0" stroke="${C.ink}" stroke-width="1.7" stroke-linecap="round" fill="none"/>`,
    ).join(""),
  wink: () =>
    `<path d="M-20 -2 Q-14 -11 -8 -2" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" fill="none"/>` +
    `<ellipse cx="14" cy="${EY}" rx="5.2" ry="7.5" fill="${C.ink}"/><circle cx="15.8" cy="${EY - 3}" r="1.8" fill="${C.cream}"/>`,
};

const mouth = {
  smile: `<path d="M-7 12 Q0 19 7 12" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
  grin: `<path d="M-9 11 Q0 23 9 11 Z" fill="${C.ink}" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/>`,
  o: `<ellipse cx="0" cy="15" rx="3.4" ry="4.4" fill="${C.ink}"/>`,
  worry: `<path d="M-6 16 Q0 11.5 6 16" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
  flat: `<path d="M-5 14 H5" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/>`,
};

const acc = {
  flag: `<path d="M46 -48 L46 -4" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M46 -48 L68 -41 L46 -34 Z" fill="${C.cream}" stroke="${C.grey}" stroke-width="1"/>
<path d="M36 -6 Q43 -9 46 -16" stroke="${C.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  sunglasses: `<path d="M-24 -9 L-38 -13 M24 -9 L38 -13" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/>
<rect x="-24" y="-13" width="18" height="12" rx="4.5" fill="${C.ink}"/>
<rect x="6" y="-13" width="18" height="12" rx="4.5" fill="${C.ink}"/>
<path d="M-6 -8 Q0 -11.5 6 -8" stroke="${C.ink}" stroke-width="2" fill="none"/>
<path d="M-20 -10 L-15 -10 M10 -10 L15 -10" stroke="${C.cream}" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/>`,
  nightcap: `<path d="M-33 -22 Q-26 -52 4 -55 Q34 -56 45 -15 Q36 -35 23 -31 Q-4 -37 -33 -22 Z" fill="${C.cap}"/>
<path d="M-35 -21 Q-4 -39 28 -30" stroke="${C.cream}" stroke-width="6" stroke-linecap="round" fill="none"/>
<circle cx="45" cy="-14" r="5.5" fill="${C.cream}" stroke="${C.grey}" stroke-width="0.8"/>`,
  map: `<path d="M-35 13 Q-29 25 -17 25 M35 13 Q29 25 17 25" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
<rect x="-19" y="17" width="38" height="24" rx="1.5" fill="${C.cream}" stroke="${C.grey}" stroke-width="1"/>
<path d="M-6.3 17 V41 M6.3 17 V41" stroke="${C.grey}" stroke-width="0.7"/>
<path d="M-14 35 Q-7 24 0 31 T13 23" stroke="${C.ink}" stroke-width="1" stroke-dasharray="2 2" fill="none"/>
<path d="M11 21 l4 4 m0 -4 l-4 4" stroke="${C.ink}" stroke-width="1.1" stroke-linecap="round"/>`,
};

/** Decorations that sit around the Dot (not on it). */
const fx = {
  zzz: `<g font-family="Geist Mono, ui-monospace, monospace" font-weight="600" fill="${C.grey}">
<text x="40" y="-40" font-size="11">z</text><text x="50" y="-54" font-size="14">z</text><text x="61" y="-70" font-size="18">z</text></g>`,
  question: `<path d="M50 -58 q0 -10 10 -10 q10 0 10 9 q0 6 -7 9 q-3 1.5 -3 6" stroke="${C.grey}" stroke-width="3.2" stroke-linecap="round" fill="none"/><circle cx="60" cy="-36" r="2.2" fill="${C.grey}"/>`,
  exclaim: [
    [-22, -52, -26, -64],
    [0, -56, 0, -70],
    [22, -52, 26, -64],
  ]
    .map(
      ([x1, y1, x2, y2]) =>
        `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.grey}" stroke-width="3" stroke-linecap="round"/>`,
    )
    .join(""),
  bounce: `<path d="M-46 52 L-56 58 M46 52 L56 58 M-38 60 L-44 68 M38 60 L44 68" stroke="${C.grey}" stroke-width="2.4" stroke-linecap="round"/>`,
  waveArcs: `<path d="M50 -30 Q60 -20 50 -10 M60 -38 Q74 -20 60 -2" stroke="${C.grey}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
  sweat: `<path d="M38 -26 q5 7 0 11 q-5 -4 0 -11 Z" fill="${C.cream}" stroke="${C.grey}" stroke-width="1.2" stroke-linejoin="round"/>`,
  orbit: `<ellipse cx="0" cy="-50" rx="34" ry="8" stroke="${C.grey}" stroke-width="1.4" stroke-dasharray="3 3" fill="none"/>
<circle cx="-30" cy="-46" r="3.4" fill="${C.cream}" stroke="${C.grey}" stroke-width="1"/><circle cx="24" cy="-56" r="2.6" fill="${C.cream}" stroke="${C.grey}" stroke-width="1"/>`,
  speed: `<path d="M-18 56 V74 M0 58 V80 M18 56 V74" stroke="${C.grey}" stroke-width="2.4" stroke-linecap="round"/>`,
  impact: `<path d="M-60 40 L-70 36 M60 40 L70 36 M-56 30 L-66 22 M56 30 L66 22" stroke="${C.grey}" stroke-width="2.4" stroke-linecap="round"/>`,
  stars: [
    [-46, -62, 4.2],
    [8, -76, 3],
    [50, -58, 5],
    [-14, -70, 2.2],
  ]
    .map(
      ([x, y, r]) =>
        `<path d="M${x} ${y - r * 1.6} L${x + r * 0.45} ${y - r * 0.45} L${x + r * 1.6} ${y} L${x + r * 0.45} ${y + r * 0.45} L${x} ${y + r * 1.6} L${x - r * 0.45} ${y + r * 0.45} L${x - r * 1.6} ${y} L${x - r * 0.45} ${y - r * 0.45} Z" fill="${C.cream}" stroke="${C.grey}" stroke-width="0.9" stroke-linejoin="round"/>`,
    )
    .join(""),
  loading: `<circle r="56" stroke="${C.grey}" stroke-width="2.2" stroke-dasharray="70 282" stroke-linecap="round" fill="none" transform="rotate(-60)"/>
<circle r="56" stroke="${C.grey}" stroke-width="1" stroke-dasharray="2 6" fill="none" opacity="0.5"/>`,
  confetti: [
    [-62, -46, 20, "r", 0],
    [-48, -70, -15, "c", 1],
    [-24, -80, 35, "r", 1],
    [6, -86, -25, "c", 0],
    [30, -78, 10, "r", 0],
    [58, -64, 50, "c", 1],
    [72, -36, -30, "r", 1],
    [-74, -14, 60, "c", 0],
    [-58, 12, -40, "r", 1],
    [74, 4, 25, "c", 0],
    [64, 30, -50, "r", 0],
    [-70, 34, 15, "c", 1],
  ]
    .map(([x, y, rot, shape, cream]) => {
      const fill = cream ? C.cream : C.orange;
      const stroke = cream ? `stroke="${C.grey}" stroke-width="0.6"` : "";
      return shape === "r"
        ? `<rect x="${x - 2.4}" y="${y - 4.2}" width="4.8" height="8.4" rx="1.2" fill="${fill}" ${stroke} transform="rotate(${rot} ${x} ${y})"/>`
        : `<circle cx="${x}" cy="${y}" r="2.8" fill="${fill}" ${stroke}/>`;
    })
    .join(""),
};

/* ------------------------------------------------------------------ poses */

/**
 * y: lift off the ground (negative = up) · rot: lean in degrees ·
 * sq: [scaleX, scaleY] squash/stretch around the feet · shadow: [scale, opacity]
 */
const POSES = [
  { id: "01-idle", label: "Idle", face: () => eyes.open() },
  { id: "02-happy", label: "Happy", face: () => eyes.happy() + mouth.smile },
  {
    id: "03-excited",
    label: "Excited (jump)",
    y: -16,
    shadow: [0.7, 0.6],
    face: () => eyes.happy() + mouth.grin,
    under: fx.bounce,
  },
  {
    id: "04-wave",
    label: "Hello / wave",
    rot: -12,
    face: () => eyes.happy() + mouth.smile,
    around: fx.waveArcs,
  },
  {
    id: "05-curious",
    label: "Curious",
    rot: 8,
    face: () => eyes.open({ gx: 4, gy: -1 }),
    around: fx.question,
  },
  {
    id: "06-surprised",
    label: "Surprised",
    face: () => eyes.open({ s: 1.18 }) + mouth.o,
    around: fx.exclaim,
  },
  {
    id: "07-sleepy",
    label: "Sleepy (nightcap)",
    face: () => eyes.closed(),
    top: acc.nightcap,
    around: fx.zzz,
  },
  {
    id: "08-dizzy",
    label: "Dizzy",
    rot: 10,
    face: () => eyes.spiral() + mouth.worry,
    around: fx.orbit,
  },
  {
    id: "09-worried",
    label: "Worried",
    face: () => eyes.open({ gy: 1.5 }) + mouth.worry,
    top: fx.sweat,
  },
  {
    id: "10-cool",
    label: "Cool (sunglasses)",
    rot: -6,
    face: () => mouth.smile,
    top: acc.sunglasses,
  },
  {
    id: "11-lost",
    label: "Lost (map)",
    face: () => eyes.open({ gy: 3 }), // looking down at the map (which covers the mouth)
    top: acc.map,
    around: fx.question,
  },
  {
    id: "12-celebrate",
    label: "Celebrate (flag)",
    y: -10,
    shadow: [0.8, 0.7],
    face: () => eyes.happy() + mouth.grin,
    behind: acc.flag,
    around: fx.confetti,
  },
  { id: "13-content", label: "Content", face: () => eyes.closed() + mouth.smile },
  {
    id: "14-wink",
    label: "Wink",
    rot: -5,
    face: () => eyes.wink() + mouth.smile,
  },
  {
    id: "15-squash",
    label: "Landing (squash)",
    sq: [1.2, 0.82],
    shadow: [1.15, 1],
    face: () => eyes.closed() + mouth.flat,
    under: fx.impact,
  },
  {
    id: "16-stretch",
    label: "Take-off (stretch)",
    y: -22,
    sq: [0.86, 1.16],
    shadow: [0.6, 0.5],
    face: () => eyes.open({ gy: -1.5 }) + mouth.o,
    under: fx.speed,
  },
  {
    id: "17-stargazing",
    label: "Stargazing",
    face: () => eyes.open({ gy: -3.5, gx: 1 }),
    around: fx.stars,
  },
  {
    id: "18-loading",
    label: "Loading",
    face: () => eyes.open({ gx: 3, gy: -2 }) + mouth.flat,
    around: fx.loading,
  },
];

function dot(p, { flat = false } = {}) {
  const [sx, sy] = p.sq ?? [1, 1];
  const [ss, so] = p.shadow ?? [1, 1];
  const y = p.y ?? 0;
  const rot = p.rot ?? 0;
  return `${
    flat
      ? ""
      : `<ellipse cx="0" cy="45" rx="${30 * ss}" ry="5" fill="url(#shadow)" opacity="${so}"/>`
  }
${p.under ?? ""}
<g transform="translate(0 ${y})">
${flat ? "" : `<circle r="54" fill="url(#halo)" opacity="0.75"/>`}
<g transform="translate(0 40) scale(${sx} ${sy}) translate(0 -40) rotate(${rot})">
${p.behind ?? ""}
<circle r="40" fill="${C.orange}"/>
${p.face()}
${p.top ?? ""}
</g>
${p.around ?? ""}
</g>`;
}

const DEFS = `<defs>
<radialGradient id="halo"><stop offset="0" stop-color="${C.peach}" stop-opacity="0.95"/><stop offset="0.62" stop-color="${C.peach}" stop-opacity="0.4"/><stop offset="1" stop-color="${C.peach}" stop-opacity="0"/></radialGradient>
<radialGradient id="shadow"><stop offset="0" stop-color="${C.ink}" stop-opacity="0.22"/><stop offset="1" stop-color="${C.ink}" stop-opacity="0"/></radialGradient>
</defs>`;

const VIEW = "-100 -100 200 200"; // square; the body is 40% of the frame in every pose

const svg = (title, body, view = VIEW) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" width="1080" height="1080">
<title>${title}</title>
${DEFS}
${body}
</svg>
`;

/* Scene: the Dot planting its flag on the Pinnacle peak (the logo mark). */
const PEAK = `<g transform="translate(-160.76 -10) ">
<path d="M25.57 226.52L160.76 29.23L295.94 226.52H25.57Z" stroke="${C.grey}" stroke-width="9.79" fill="none"/>
<path d="M160.76 29.23V138.84M160.76 138.84L25.57 226.52M160.76 138.84L295.94 226.52" stroke="${C.grey}" stroke-width="9.79" fill="none"/>
<circle cx="25.28" cy="224.27" r="23.65" fill="${C.cap}"/>
<circle cx="286.25" cy="224.27" r="23.65" fill="${C.cap}"/>
<circle cx="160.76" cy="138.84" r="20.09" fill="${C.cap}"/>
</g>`;
const summit = (flat) =>
  // Body bottom (y 40 × 1.05) rests on the apex at y ≈ 19.
  `${PEAK}<g transform="translate(0 -22) scale(1.05)">${dot(
    {
      face: () => eyes.happy() + mouth.grin,
      behind: acc.flag,
      shadow: [0.6, 0.5],
    },
    { flat },
  ).replace(/<ellipse cx="0" cy="45"[^>]*\/>/, "")}</g>`;
const SCENES = [
  {
    id: "19-summit",
    label: "Summit (on the peak)",
    view: "-185 -95 370 370",
    body: summit,
  },
];

/* ------------------------------------------------------------------ write */

await mkdir(path.join(OUT, "svg/flat"), { recursive: true });
await mkdir(path.join(OUT, "png/flat"), { recursive: true });

const files = [];
for (const p of POSES) {
  for (const flat of [false, true]) {
    const name = `${flat ? "flat/" : ""}${p.id}.svg`;
    const code = svg(`The Dot — ${p.label}`, dot(p, { flat }));
    await writeFile(path.join(OUT, "svg", name), code);
    files.push({ ...p, flat, name, code });
  }
}
for (const s of SCENES) {
  for (const flat of [false, true]) {
    const name = `${flat ? "flat/" : ""}${s.id}.svg`;
    const code = svg(`The Dot — ${s.label}`, s.body(flat), s.view);
    await writeFile(path.join(OUT, "svg", name), code);
    files.push({ ...s, flat, name, code });
  }
}

// Contact sheet
const cards = files
  .filter((f) => !f.flat)
  .map(
    (
      f,
    ) => `<figure><div class="pair"><div class="tile">${f.code}</div><div class="tile night">${f.code}</div></div>
<figcaption><b>${f.label}</b><span>${f.id}.svg</span></figcaption></figure>`,
  )
  .join("\n");
const sheet = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Dot — pose pack</title>
<style>
:root{--bg:${C.bg};--ink:${C.ink};--soft:#5e5e5c;--night:${C.night}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.4 system-ui,sans-serif;padding:48px 16px}
header{max-width:1200px;margin:0 auto 32px}h1{font:600 28px/1.1 Georgia,serif;margin:0 0 8px}p{margin:0;color:var(--soft)}
main{max-width:1200px;margin:0 auto;display:grid;gap:24px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
figure{margin:0}.pair{display:grid;grid-template-columns:1fr 1fr;border:1px solid #d9d4c9;border-radius:8px;overflow:hidden}
.tile{aspect-ratio:1;display:grid;place-items:center;background:var(--bg)}.tile.night{background:var(--night)}
.tile svg{width:100%;height:100%}figcaption{display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:13px}
figcaption span{color:var(--soft);font-family:ui-monospace,monospace;font-size:12px}
</style></head><body>
<header><h1>The Dot — pose pack</h1><p>${files.filter((f) => !f.flat).length} poses · transparent SVG + 2048px PNG · every pose shares the same framing, so they swap cleanly in an edit. <code>flat/</code> versions have no glow or shadow.</p></header>
<main>${cards}</main></body></html>`;
await writeFile(path.join(OUT, "index.html"), sheet);

// PNG exports (transparent) + contact sheet image
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 2048, height: 2048 });
for (const f of files) {
  const html = `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:2048px;height:2048px}</style></head><body>${f.code}</body></html>`;
  await page.setContent(html);
  await page.screenshot({
    path: path.join(OUT, "png", f.name.replace(/\.svg$/, ".png")),
    omitBackground: true,
    clip: { x: 0, y: 0, width: 2048, height: 2048 },
  });
}
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await page.setContent(sheet);
await page.screenshot({ path: path.join(OUT, "contact-sheet.png"), fullPage: true });
await browser.close();

console.log(`${files.length} SVGs + PNGs → ${path.relative(process.cwd(), OUT)}`);
