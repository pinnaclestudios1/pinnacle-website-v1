/**
 * Demo media generator — renders every image and looping video the demo content uses
 * (content/demo) into public/demo/, with headless Chrome. Nothing is downloaded.
 *
 *   npm run demo:media
 *
 * - Case studies: website / app mockups in each fictional client's palette
 *   (hero + two design screens, WebP) and a seamless 5 s interface loop (WebM, VP9,
 *   recorded from a canvas with MediaRecorder) with a poster frame.
 * - People: illustrated, faceless portraits (deliberately not realistic faces).
 * - Studio life: four flat illustrations. Logos: SVG wordmarks.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const OUT = path.resolve("public/demo");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const PROJECTS = {
  "kestrel-analytics": {
    name: "Kestrel",
    tag: "Revenue, explained.",
    kind: "dashboard",
    bg: "#0f1b2d",
    surface: "#16253b",
    ink: "#e8eef7",
    soft: "#8aa0bd",
    accent: "#2dd4bf",
    accent2: "#f4b860",
  },
  "saffron-and-salt": {
    name: "Saffron & Salt",
    tag: "Six kitchens. One table.",
    kind: "shop",
    bg: "#fbf3e4",
    surface: "#ffffff",
    ink: "#3a1d12",
    soft: "#9a7b68",
    accent: "#e8a33d",
    accent2: "#8c2f1b",
  },
  "tidewell-health": {
    name: "Tidewell",
    tag: "Good days, gently.",
    kind: "phone",
    bg: "#e6f2ef",
    surface: "#ffffff",
    ink: "#173b3a",
    soft: "#6a8f8c",
    accent: "#2f7d7a",
    accent2: "#b7a6e0",
  },
  "arcline-mobility": {
    name: "Arcline",
    tag: "Charge in motion.",
    kind: "brand",
    bg: "#0b0b0c",
    surface: "#18181b",
    ink: "#f4f4f5",
    soft: "#8b8b93",
    accent: "#c6f432",
    accent2: "#ffffff",
  },
  "folio-learning": {
    name: "Folio",
    tag: "Lessons that move.",
    kind: "dashboard",
    bg: "#fffaf0",
    surface: "#ffffff",
    ink: "#1f1b4d",
    soft: "#7c78a6",
    accent: "#4f46e5",
    accent2: "#fb7185",
  },
};

const PEOPLE = {
  aarav: { bg: "#e8dcc8", skin: "#c58c62", hair: "#231a14", style: "short", top: "#2d3a4a" },
  meera: { bg: "#d9e4dc", skin: "#9c6a46", hair: "#1a1310", style: "long", top: "#7a3b2e" },
  kabir: { bg: "#dfe3ec", skin: "#d4a27a", hair: "#3b2a1e", style: "curly", top: "#3f4f3a" },
  zoya: { bg: "#efdcd6", skin: "#b07650", hair: "#140f0c", style: "bun", top: "#2f2f4f" },
  rohan: { bg: "#e5e0d4", skin: "#8a5a3c", hair: "#0f0c0a", style: "short", top: "#a7672b" },
  isha: { bg: "#dbe6ea", skin: "#e0b391", hair: "#4a2e1c", style: "long", top: "#334155" },
  ananya: { bg: "#e9e2d2", skin: "#b9805a", hair: "#1c1410", style: "bun", top: "#1f4e5f" },
  dev: { bg: "#dde5df", skin: "#9e6b48", hair: "#151010", style: "short", top: "#5b3a29" },
  leah: { bg: "#e7dde6", skin: "#d8a983", hair: "#5a3a26", style: "curly", top: "#3d3a6b" },
};

const LOGOS = {
  kestrel: { name: "Kestrel", mark: "wing" },
  "saffron-salt": { name: "Saffron & Salt", mark: "leaf", serif: true },
  tidewell: { name: "Tidewell", mark: "wave" },
  arcline: { name: "ARCLINE", mark: "arc" },
  folio: { name: "folio", mark: "page" },
  northbay: { name: "Northbay", mark: "peak", serif: true },
};

/* ------------------------------------------------------------------ html scenes */

const FONT = `font-family: "Segoe UI", system-ui, -apple-system, sans-serif;`;
const SERIF = `font-family: Georgia, "Times New Roman", serif;`;

const page = (w, h, body, extra = "") => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{${FONT}}${extra}</style></head><body>${body}</body></html>`;

function browser(p, inner, { w = 1600, h = 1000 } = {}) {
  return page(
    w,
    h,
    `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${p.bg},${p.surface});padding:56px 72px">
      <div style="height:100%;border-radius:14px;overflow:hidden;background:${p.bg};box-shadow:0 40px 90px -30px rgba(0,0,0,.45),0 0 0 1px rgba(127,127,127,.18)">
        <div style="height:46px;display:flex;align-items:center;gap:8px;padding:0 18px;background:${p.surface};border-bottom:1px solid rgba(127,127,127,.18)">
          <i style="width:11px;height:11px;border-radius:50%;background:#ff5f57"></i><i style="width:11px;height:11px;border-radius:50%;background:#febc2e"></i><i style="width:11px;height:11px;border-radius:50%;background:#28c840"></i>
          <span style="margin-left:18px;height:22px;width:340px;border-radius:6px;background:rgba(127,127,127,.14)"></span>
        </div>
        <div style="position:relative;height:calc(100% - 46px);color:${p.ink}">${inner}</div>
      </div></div>`,
  );
}

const nav = (
  p,
) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:26px 40px">
  <b style="font-size:22px;letter-spacing:-.01em">${p.name}</b>
  <div style="display:flex;gap:28px;font-size:15px;color:${p.soft}"><span>Product</span><span>Stories</span><span>Pricing</span><span>About</span></div>
  <span style="padding:10px 18px;border-radius:999px;background:${p.accent};color:${p.bg};font-size:14px;font-weight:600">Get started</span></div>`;

function dashboard(p, variant = 0) {
  const bars = Array.from({ length: 12 }, (_, i) => 30 + ((i * 37 + variant * 13) % 60));
  return `<div style="display:grid;grid-template-columns:220px 1fr;height:100%">
    <aside style="background:${p.surface};padding:28px 22px;display:flex;flex-direction:column;gap:14px;border-right:1px solid rgba(127,127,127,.15)">
      <b style="font-size:20px;margin-bottom:18px">${p.name}</b>
      ${["Overview", "Revenue", "Customers", "Reports", "Settings"].map((t, i) => `<span style="padding:9px 12px;border-radius:8px;font-size:14px;${i === variant % 3 ? `background:${p.accent}22;color:${p.accent};font-weight:600` : `color:${p.soft}`}">${t}</span>`).join("")}
    </aside>
    <main style="padding:34px 40px;display:flex;flex-direction:column;gap:22px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div><div style="font-size:14px;color:${p.soft}">This quarter</div><div style="font-size:34px;font-weight:650;letter-spacing:-.02em">Why revenue moved</div></div>
        <span style="font-size:13px;color:${p.soft}">Updated 2 min ago</span></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
        ${[
          ["Net revenue", "₹4.82 Cr", "+12.4%"],
          ["Expansion", "₹96 L", "+31%"],
          ["Churn", "2.1%", "−0.6 pts"],
        ]
          .map(
            ([
              k,
              v,
              d,
            ]) => `<div style="background:${p.surface};border-radius:12px;padding:20px 22px;border:1px solid rgba(127,127,127,.15)">
          <div style="font-size:13px;color:${p.soft}">${k}</div><div style="font-size:28px;font-weight:650;margin-top:6px">${v}</div>
          <div style="font-size:13px;color:${p.accent};margin-top:4px">${d}</div></div>`,
          )
          .join("")}
      </div>
      <div style="flex:1;background:${p.surface};border-radius:12px;padding:24px;border:1px solid rgba(127,127,127,.15);display:flex;flex-direction:column">
        <div style="font-size:14px;color:${p.soft};margin-bottom:16px">Revenue bridge — what changed since last quarter</div>
        <div style="flex:1;display:flex;align-items:flex-end;gap:16px">
          ${bars.map((b, i) => `<div style="flex:1;height:${b}%;border-radius:6px 6px 2px 2px;background:${i % 4 === 3 ? p.accent2 : p.accent};opacity:${0.55 + (i % 3) * 0.15}"></div>`).join("")}
        </div></div>
    </main></div>`;
}

function shop(p, variant = 0) {
  const dishes = ["Saffron biryani", "Smoked paneer tikka", "Kokum sorbet", "Butter garlic naan"];
  return `${nav(p)}
  <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:40px;padding:10px 40px 0">
    <div style="padding-top:40px"><div style="${SERIF}font-size:64px;line-height:1;letter-spacing:-.02em;color:${p.accent2}">${variant ? "Your usual,<br>in three taps." : "Six kitchens.<br>One table."}</div>
      <p style="margin-top:22px;font-size:18px;color:${p.soft};max-width:420px">Order from any of our kitchens for pickup or delivery — ready when we say it is.</p>
      <div style="margin-top:30px;display:flex;gap:12px"><span style="padding:14px 24px;border-radius:999px;background:${p.accent2};color:#fff;font-weight:600">Order now</span><span style="padding:14px 24px;border-radius:999px;border:1.5px solid ${p.accent2};color:${p.accent2};font-weight:600">See menus</span></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      ${dishes
        .map(
          (
            d,
            i,
          ) => `<div style="background:${p.surface};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px -18px rgba(58,29,18,.4)">
        <div style="height:150px;background:radial-gradient(circle at ${30 + i * 15}% 40%,${p.accent} 0 22%,${p.accent2}cc 23% 34%,#f6e3c3 35%)"></div>
        <div style="padding:14px 16px"><div style="font-weight:600;font-size:15px">${d}</div><div style="font-size:13px;color:${p.soft};margin-top:4px">₹${280 + i * 70}</div></div></div>`,
        )
        .join("")}
    </div></div>`;
}

function phoneScreen(p, variant) {
  const ring = variant === 0 ? 0.72 : 0.45;
  const c = 2 * Math.PI * 70;
  return `<div style="width:300px;height:620px;border-radius:44px;background:#111;padding:12px;box-shadow:0 40px 80px -30px rgba(23,59,58,.55)">
    <div style="width:100%;height:100%;border-radius:34px;background:${p.surface};overflow:hidden;padding:30px 22px;color:${p.ink}">
      <div style="font-size:13px;color:${p.soft}">${variant === 0 ? "Thursday" : "This week"}</div>
      <div style="font-size:26px;font-weight:650;margin-top:4px;letter-spacing:-.01em">${variant === 0 ? "A good day so far" : "Your rhythm"}</div>
      <svg width="256" height="190" viewBox="0 0 256 190" style="margin-top:16px"><circle cx="128" cy="95" r="70" stroke="${p.accent}22" stroke-width="16" fill="none"/>
        <circle cx="128" cy="95" r="70" stroke="${p.accent}" stroke-width="16" fill="none" stroke-linecap="round" stroke-dasharray="${c * ring} ${c}" transform="rotate(-90 128 95)"/>
        <text x="128" y="103" text-anchor="middle" font-size="30" font-weight="650" fill="${p.ink}">${Math.round(ring * 100)}%</text></svg>
      ${["Morning dose", "Evening walk", "Water", "Night dose"]
        .map(
          (
            t,
            i,
          ) => `<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #00000010">
        <i style="width:22px;height:22px;border-radius:50%;${i < (variant === 0 ? 2 : 1) ? `background:${p.accent}` : `border:2px solid ${p.accent2}`}"></i>
        <span style="font-size:15px">${t}</span><span style="margin-left:auto;font-size:12px;color:${p.soft}">${["8:00", "18:30", "All day", "22:00"][i]}</span></div>`,
        )
        .join("")}
    </div></div>`;
}

function phones(p, variant = 0) {
  return page(
    1600,
    1000,
    `<div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,${p.surface},${p.bg});display:flex;align-items:center;justify-content:center;gap:70px">
      <div style="transform:translateY(${variant ? 30 : -20}px) rotate(-4deg)">${phoneScreen(p, 0)}</div>
      <div style="transform:translateY(${variant ? -30 : 30}px) rotate(3deg)">${phoneScreen(p, 1)}</div>
      ${variant ? "" : `<div style="position:absolute;left:110px;bottom:110px;color:${p.ink}"><div style="font-size:54px;font-weight:650;letter-spacing:-.02em">${p.name}</div><div style="font-size:20px;color:${p.soft};margin-top:6px">${p.tag}</div></div>`}
    </div>`,
  );
}

function brand(p, variant = 0) {
  const arc = (size, sw) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><path d="M18 74 A40 40 0 1 1 82 74" stroke="${p.accent}" stroke-width="${sw}" fill="none" stroke-linecap="round"/><circle cx="82" cy="74" r="${sw * 0.8}" fill="${p.accent}"/></svg>`;
  if (variant === 0)
    return page(
      1600,
      1000,
      `<div style="position:absolute;inset:0;background:${p.bg};color:${p.ink};display:grid;grid-template-columns:1fr 1fr">
        <div style="display:flex;align-items:center;justify-content:center">${arc(420, 9)}</div>
        <div style="display:flex;flex-direction:column;justify-content:center;gap:26px;padding-right:110px">
          <div style="font-size:96px;font-weight:800;letter-spacing:.06em">ARCLINE</div>
          <div style="font-size:22px;color:${p.soft}">${p.tag}</div>
          <div style="display:flex;gap:14px;margin-top:20px">${[p.accent, "#ffffff", "#27272a", "#3f6212"].map((c) => `<i style="width:84px;height:84px;border-radius:14px;background:${c};border:1px solid #ffffff22"></i>`).join("")}</div>
          <div style="display:flex;gap:30px;margin-top:10px;color:${p.soft};font-size:14px;letter-spacing:.1em">${["STATUS", "MAP PIN", "APP ICON"].map((t) => `<span>${t}</span>`).join("")}</div>
        </div></div>`,
    );
  return browser(
    p,
    `${nav(p)}<div style="display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:40px 60px">
      <div><div style="font-size:72px;font-weight:800;line-height:1;letter-spacing:-.01em">Charge<br>in motion.</div><p style="margin-top:22px;font-size:18px;color:${p.soft}">40 stations across the city. Find one, plug in, go.</p></div>
      <div style="display:flex;justify-content:center">${arc(380, 8)}</div></div>`,
  );
}

function avatar(id) {
  const a = PEOPLE[id];
  const hair = {
    short: `<path d="M150 150 Q240 70 330 150 Q330 115 300 100 Q240 70 180 100 Q150 115 150 150Z" fill="${a.hair}"/>`,
    long: `<path d="M140 175 Q130 80 240 75 Q350 80 340 175 L345 300 Q320 290 315 250 Q300 140 240 130 Q180 140 165 250 Q160 290 135 300Z" fill="${a.hair}"/>`,
    curly: `${Array.from({ length: 9 }, (_, i) => `<circle cx="${160 + i * 20}" cy="${108 + (i % 2) * 14}" r="30" fill="${a.hair}"/>`).join("")}`,
    bun: `<circle cx="240" cy="72" r="34" fill="${a.hair}"/><path d="M152 160 Q240 72 328 160 Q320 110 240 98 Q160 110 152 160Z" fill="${a.hair}"/>`,
  }[a.style];
  return page(
    480,
    480,
    `<svg width="480" height="480" viewBox="0 0 480 480"><rect width="480" height="480" fill="${a.bg}"/>
      <circle cx="380" cy="90" r="120" fill="#ffffff" opacity=".25"/>
      <path d="M90 480 Q100 330 240 320 Q380 330 390 480Z" fill="${a.top}"/>
      <rect x="212" y="250" width="56" height="80" rx="26" fill="${a.skin}"/>
      <ellipse cx="240" cy="190" rx="92" ry="104" fill="${a.skin}"/>
      ${hair}</svg>`,
  );
}

function studio(n) {
  const scenes = {
    1: `<div style="position:absolute;inset:0;background:#efe9df;padding:70px;display:grid;grid-template-columns:repeat(6,1fr);gap:26px">
      ${Array.from(
        { length: 18 },
        (
          _,
          i,
        ) => `<div style="background:${["#ffe7a3", "#ffd0c2", "#cfe8d8", "#d6dcf5"][i % 4]};transform:rotate(${((i * 7) % 9) - 4}deg);box-shadow:0 8px 14px -10px rgba(0,0,0,.3);padding:16px">
        ${Array.from({ length: 3 }, (_, k) => `<i style="display:block;height:5px;margin-top:${k ? 10 : 6}px;width:${60 + (((i + k) * 13) % 35)}%;background:#3b3b3b;opacity:.55;border-radius:3px"></i>`).join("")}</div>`,
      ).join("")}</div>`,
    2: `<div style="position:absolute;inset:0;background:#e6e1d8;display:flex;align-items:center;justify-content:center;gap:40px">
      ${[0, 1, 2]
        .map(
          (
            i,
          ) => `<div style="width:300px;height:420px;background:#fff;transform:rotate(${[-3, 2, -1][i]}deg);box-shadow:0 20px 40px -24px rgba(0,0,0,.35);padding:26px;position:relative">
        <i style="position:absolute;top:-8px;left:50%;width:16px;height:16px;border-radius:50%;background:#ff5b27"></i>
        ${[60, 30, 100, 45, 80].map((h, k) => `<div style="height:${h}px;border:2px solid #9a9a96;border-radius:6px;margin-top:${k ? 14 : 0}px;width:${k % 2 ? 70 : 100}%"></div>`).join("")}</div>`,
        )
        .join("")}</div>`,
    3: `<div style="position:absolute;inset:0;background:#b98a5e;background-image:repeating-linear-gradient(90deg,#00000008 0 2px,transparent 2px 60px)">
      <div style="position:absolute;left:250px;top:180px;width:560px;height:360px;background:#2a2a2e;border-radius:18px;padding:18px;transform:rotate(-6deg);box-shadow:0 30px 50px -20px rgba(0,0,0,.5)"><div style="width:100%;height:100%;border-radius:8px;background:linear-gradient(135deg,#f6f1e7,#e9e2d4);padding:24px"><div style="font:600 34px Georgia,serif;color:#1e1e1e">We build websites</div><div style="margin-top:14px;height:12px;width:60%;background:#cfc8bb;border-radius:6px"></div><i style="display:block;margin-top:30px;width:46px;height:46px;border-radius:50%;background:#ff5b27"></i></div></div>
      <div style="position:absolute;right:220px;top:220px;width:240px;height:320px;background:#f4efe4;border-radius:6px;transform:rotate(8deg);box-shadow:0 20px 30px -18px rgba(0,0,0,.45);padding:22px">${Array.from({ length: 8 }, (_, k) => `<i style="display:block;height:3px;margin-top:18px;background:#8a8478;width:${70 + ((k * 17) % 30)}%"></i>`).join("")}</div>
      <div style="position:absolute;right:300px;bottom:120px;width:120px;height:120px;border-radius:50%;background:#f4efe4;box-shadow:0 14px 24px -14px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center"><i style="width:84px;height:84px;border-radius:50%;background:#5a3a22"></i></div></div>`,
    4: `<div style="position:absolute;inset:0;background:#f4efe6;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:80px">
      <div style="display:grid;grid-template-columns:repeat(3,130px);gap:22px">${["#ff5b27", "#1e1e1e", "#f6f1e7", "#777775", "#ffd9c6", "#353535"].map((c) => `<div><div style="width:130px;height:130px;border-radius:10px;background:${c};border:1px solid #00000014"></div><div style="font:12px ui-monospace,monospace;color:#5e5e5c;margin-top:8px">${c.toUpperCase()}</div></div>`).join("")}</div>
      <div style="${SERIF}color:#1e1e1e"><div style="font-size:220px;line-height:1">Aa</div><div style="font-size:22px;color:#5e5e5c;margin-top:10px;${FONT}">Display · Body · Mono</div></div></div>`,
  };
  return page(1200, 900, scenes[n]);
}

function logoSvg(l) {
  const marks = {
    wing: `<path d="M4 20 Q14 4 30 8 Q20 12 16 22 Z" fill="currentColor"/>`,
    leaf: `<path d="M6 24 Q6 6 26 4 Q26 22 6 24Z M6 24 L20 10" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
    wave: `<path d="M3 18 Q9 10 15 18 T27 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
    arc: `<path d="M5 22 A12 12 0 1 1 25 22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>`,
    page: `<rect x="6" y="4" width="18" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M10 11h10M10 16h7" stroke="currentColor" stroke-width="2.2"/>`,
    peak: `<path d="M3 25 L13 8 L18 16 L21 12 L28 25Z" fill="currentColor"/>`,
  };
  const font = l.serif
    ? "Georgia, 'Times New Roman', serif"
    : "'Segoe UI', Helvetica, Arial, sans-serif";
  const w = 40 + l.name.length * 13;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 30" height="30" color="#3d3d3b"><g>${marks[l.mark]}</g><text x="38" y="21" font-family="${font}" font-size="18" font-weight="${l.serif ? 400 : 600}" fill="#3d3d3b" letter-spacing="${l.name === "ARCLINE" ? 2 : 0}">${l.name.replace("&", "&amp;")}</text></svg>`;
}

/* ------------------------------------------------------------------ video loops */

const LOOP_SCRIPT = String.raw`
async function recordLoop(p, kind, seconds) {
  const W = 1280, H = 800, FPS = 30;
  const c = document.createElement("canvas"); c.width = W; c.height = H; document.body.appendChild(c);
  const g = c.getContext("2d");
  const rr = (x, y, w, h, r, fill) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); };
  const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * 2 * t); // 0→1→0, seamless
  function frame(t) {
    g.fillStyle = p.bg; g.fillRect(0, 0, W, H);
    if (kind === "dashboard") {
      rr(60, 60, 1160, 680, 18, p.surface);
      g.fillStyle = p.ink; g.font = "600 34px Segoe UI, sans-serif"; g.fillText(p.name, 110, 135);
      g.fillStyle = p.soft; g.font = "18px Segoe UI, sans-serif"; g.fillText("Live — revenue by week", 110, 170);
      const n = 14;
      for (let i = 0; i < n; i++) {
        const base = 0.35 + 0.5 * Math.abs(Math.sin(i * 1.7 + 1));
        const h = 380 * (base * (0.75 + 0.25 * ease((t + i / n) % 1)));
        rr(110 + i * 76, 690 - h, 50, h, 8, i % 5 === 4 ? p.accent2 : p.accent);
      }
      g.strokeStyle = p.ink; g.globalAlpha = 0.6; g.lineWidth = 3; g.beginPath();
      for (let x = 0; x <= 1060; x += 10) {
        const y = 420 + 70 * Math.sin(x / 120 + t * Math.PI * 2) * 0.6 + 40 * Math.sin(x / 47);
        x ? g.lineTo(110 + x, y) : g.moveTo(110, y);
      }
      g.stroke(); g.globalAlpha = 1;
    } else if (kind === "shop") {
      g.fillStyle = p.accent2; g.font = "64px Georgia, serif"; g.fillText("Your usual, in three taps.", 90, 150);
      const off = -((t * 4) % 1) * 300;
      for (let i = -1; i < 6; i++) {
        const x = 90 + i * 300 + off;
        rr(x, 230, 260, 380, 22, p.surface);
        const grd = g.createRadialGradient(x + 130, 340, 10, x + 130, 340, 120);
        grd.addColorStop(0, p.accent); grd.addColorStop(0.5, p.accent2); grd.addColorStop(1, "#f6e3c3");
        g.fillStyle = grd; g.beginPath(); g.roundRect(x, 230, 260, 220, [22, 22, 0, 0]); g.fill();
        g.fillStyle = p.ink; g.font = "600 22px Segoe UI, sans-serif"; g.fillText(["Biryani", "Paneer tikka", "Sorbet", "Naan"][((i % 4) + 4) % 4], x + 20, 500);
        g.fillStyle = p.soft; g.font = "18px Segoe UI, sans-serif"; g.fillText("₹" + (280 + (((i % 4) + 4) % 4) * 70), x + 20, 535);
      }
      const pulse = 1 + 0.06 * ease((t * 2) % 1);
      g.save(); g.translate(1040, 690); g.scale(pulse, pulse); rr(-150, -36, 300, 72, 36, p.accent2);
      g.fillStyle = "#fff"; g.font = "600 24px Segoe UI, sans-serif"; g.textAlign = "center"; g.fillText("Reorder · ₹640", 0, 9); g.restore(); g.textAlign = "left";
    } else if (kind === "phone") {
      const px = 490, py = 60;
      rr(px, py, 300, 680, 46, "#111"); rr(px + 12, py + 12, 276, 656, 36, p.surface);
      g.fillStyle = p.ink; g.font = "600 26px Segoe UI, sans-serif"; g.fillText("A good day so far", px + 34, py + 92);
      const prog = 0.35 + 0.5 * ease(t);
      g.lineWidth = 18; g.lineCap = "round"; g.strokeStyle = p.accent + "33"; g.beginPath(); g.arc(px + 150, py + 250, 85, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = p.accent; g.beginPath(); g.arc(px + 150, py + 250, 85, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); g.stroke();
      g.fillStyle = p.ink; g.font = "600 34px Segoe UI, sans-serif"; g.textAlign = "center"; g.fillText(Math.round(prog * 100) + "%", px + 150, py + 262); g.textAlign = "left";
      ["Morning dose", "Evening walk", "Water", "Night dose"].forEach((s, i) => {
        const y = py + 410 + i * 58; const done = prog > 0.3 + i * 0.15;
        g.beginPath(); g.arc(px + 50, y, 12, 0, Math.PI * 2); g.fillStyle = done ? p.accent : p.surface; g.fill();
        g.lineWidth = 2.5; g.strokeStyle = done ? p.accent : p.accent2; g.stroke();
        g.fillStyle = p.ink; g.font = "19px Segoe UI, sans-serif"; g.fillText(s, px + 76, y + 7);
      });
      g.fillStyle = p.ink; g.font = "600 56px Segoe UI, sans-serif"; g.fillText(p.name, 100, 360);
      g.fillStyle = p.soft; g.font = "22px Segoe UI, sans-serif"; g.fillText(p.tag, 104, 400);
    } else if (kind === "brand") {
      const cx = W / 2, cy = H / 2 + 20, r = 190;
      const sweep = Math.PI * 1.55;
      const prog = ease(t);
      g.lineCap = "round"; g.lineWidth = 22; g.strokeStyle = p.accent + "22";
      g.beginPath(); g.arc(cx, cy, r, Math.PI * 0.72, Math.PI * 0.72 + sweep); g.stroke();
      g.strokeStyle = p.accent; g.beginPath(); g.arc(cx, cy, r, Math.PI * 0.72, Math.PI * 0.72 + sweep * (0.08 + 0.92 * prog)); g.stroke();
      const a = Math.PI * 0.72 + sweep * (0.08 + 0.92 * prog);
      g.fillStyle = p.accent; g.beginPath(); g.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 18, 0, Math.PI * 2); g.fill();
      g.fillStyle = p.ink; g.font = "800 40px Segoe UI, sans-serif"; g.textAlign = "center"; g.fillText("ARCLINE", cx, cy + 14);
      g.fillStyle = p.soft; g.font = "20px Segoe UI, sans-serif"; g.fillText("Charging · " + Math.round(20 + prog * 80) + "%", cx, cy + 50); g.textAlign = "left";
    }
  }
  frame(0);
  const poster = c.toDataURL("image/webp", 0.85);
  const stream = c.captureStream(FPS);
  const rec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 1_100_000 });
  const chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise((r) => (rec.onstop = r));
  rec.start();
  const total = seconds * 1000; const t0 = performance.now();
  await new Promise((resolve) => {
    const tick = () => { const el = performance.now() - t0; frame((el % total) / total); el < total ? requestAnimationFrame(tick) : resolve(); };
    requestAnimationFrame(tick);
  });
  rec.stop(); await done;
  const blob = new Blob(chunks, { type: "video/webm" });
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = ""; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { video: btoa(bin), poster };
}`;

/* ------------------------------------------------------------------ run */

const browserApp = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const tab = await browserApp.newPage();

async function shot(html, file, w, h) {
  await tab.setViewport({ width: w, height: h });
  await tab.setContent(html, { waitUntil: "load" });
  await mkdir(path.dirname(file), { recursive: true });
  await tab.screenshot({
    path: file,
    type: "webp",
    quality: 82,
    clip: { x: 0, y: 0, width: w, height: h },
  });
}

const scenes = (p, slug) => {
  if (p.kind === "dashboard")
    return [browser(p, dashboard(p, 0)), browser(p, dashboard(p, 1)), browser(p, dashboard(p, 2))];
  if (p.kind === "shop")
    return [
      browser(p, shop(p, 0)),
      browser(p, shop(p, 1)),
      browser(p, shop(p, 0).replace("Six kitchens", "Pick up at")),
    ];
  if (p.kind === "phone") return [phones(p, 0), phones(p, 1), phones(p, 0)];
  return [brand(p, 0), brand(p, 1), brand(p, 0)];
};

for (const [slug, p] of Object.entries(PROJECTS)) {
  const [hero, s1, s2] = scenes(p, slug);
  const dir = path.join(OUT, "projects", slug);
  await shot(hero, path.join(dir, "hero.webp"), 1600, 1000);
  await shot(s1, path.join(dir, "screen-1.webp"), 1600, 1000);
  await shot(s2, path.join(dir, "screen-2.webp"), 1600, 1000);

  await tab.setViewport({ width: 1280, height: 800 });
  await tab.setContent("<!doctype html><html><body style='margin:0'></body></html>");
  await tab.addScriptTag({ content: LOOP_SCRIPT });
  const { video, poster } = await tab.evaluate(
    (pp, kind) => window.recordLoop(pp, kind, 5),
    p,
    p.kind,
  );
  await writeFile(path.join(dir, "loop.webm"), Buffer.from(video, "base64"));
  await writeFile(path.join(dir, "loop-poster.webp"), Buffer.from(poster.split(",")[1], "base64"));
  console.log(
    `projects/${slug}: hero, 2 screens, loop (${Math.round(Buffer.from(video, "base64").length / 1024)} KB)`,
  );
}

for (const id of Object.keys(PEOPLE))
  await shot(avatar(id), path.join(OUT, "people", `${id}.webp`), 480, 480);
console.log(`people: ${Object.keys(PEOPLE).length} portraits`);

for (const n of [1, 2, 3, 4])
  await shot(studio(n), path.join(OUT, "studio", `studio-${n}.webp`), 1200, 900);
console.log("studio: 4 illustrations");

await mkdir(path.join(OUT, "logos"), { recursive: true });
for (const [slug, l] of Object.entries(LOGOS))
  await writeFile(path.join(OUT, "logos", `${slug}.svg`), logoSvg(l));
console.log(`logos: ${Object.keys(LOGOS).length} wordmarks`);

await browserApp.close();
