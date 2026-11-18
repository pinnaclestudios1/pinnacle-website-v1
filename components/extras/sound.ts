import { dot } from "@/components/dot/controller";
import type { Reaction } from "@/components/dot/types";

/**
 * Sound (brief §9: optional, off by default). No background loop — only small,
 * soft notes when the Dot does something:
 * - a warm plucked note (kalimba-like) when it lands from a hop or a hand-off flight,
 *   walking gently up and down a pentatonic scale so consecutive hops form a melody
 *   and never clash;
 * - a short rising arpeggio when it celebrates, and once at the summit.
 * Everything is synthesised with the Web Audio API (no audio files) and passes through
 * a low-pass filter and a soft echo, so nothing is sharp or loud.
 * Lazy-loaded the first time the visitor turns sound on (a user gesture, so the
 * browser allows audio).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: AudioNode | null = null;
let cleanup: (() => void) | null = null;

/** When each reaction's landing (or highlight) happens, in seconds after it starts. */
const LANDINGS: Partial<Record<Reaction, number[]>> = {
  guide: [0.38],
  excited: [0.3, 0.58],
  wake: [0.46],
  drop: [0.42, 0.72],
  backflip: [0.7],
  wave: [0.4],
};

/** C major pentatonic, C5 → E6: any two notes sound good together. */
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
let step = 2;
let lastPluck = 0;

/** The next note: a small random step up or down the scale (a gentle melody). */
function nextNote() {
  const move = [-2, -1, 1, 1, 2][Math.floor(Math.random() * 5)]!;
  step = Math.min(SCALE.length - 1, Math.max(0, step + move));
  return SCALE[step]!;
}

/** A soft pluck: sine body + a quiet, quickly fading overtone (kalimba / glass marimba). */
function pluck(c: AudioContext, out: AudioNode, at: number, freq: number, vol = 0.16) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
  g.connect(out);

  const body = c.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(freq, at);
  body.connect(g);

  // The "tine" overtone gives it a plucked character and dies away fast.
  const tine = c.createOscillator();
  const tg = c.createGain();
  tine.type = "sine";
  tine.frequency.setValueAtTime(freq * 3.01, at);
  tg.gain.setValueAtTime(0.0001, at);
  tg.gain.exponentialRampToValueAtTime(vol * 0.35, at + 0.004);
  tg.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
  tine.connect(tg).connect(out);

  body.start(at);
  tine.start(at);
  body.stop(at + 1);
  tine.stop(at + 0.2);
}

/** Landing note, at most one every 140ms so fast scrolling never chatters. */
function land(at: number) {
  if (!ctx || !bus) return;
  if (at - lastPluck < 0.14) return;
  lastPluck = at;
  pluck(ctx, bus, at, nextNote());
}

/** Celebration: a soft rising arpeggio (C – E – G – C). */
function arpeggio(c: AudioContext, out: AudioNode, at: number) {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => pluck(c, out, at + i * 0.09, f, 0.13));
}

function build(c: AudioContext) {
  master = c.createGain();
  master.gain.value = 0;
  master.connect(c.destination);

  // Warmth: roll off the highs, then add a soft, quiet echo.
  const tone = c.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2600;
  tone.Q.value = 0.5;
  tone.connect(master);

  const delay = c.createDelay(1);
  delay.delayTime.value = 0.21;
  const feedback = c.createGain();
  feedback.gain.value = 0.22;
  const wet = c.createGain();
  wet.gain.value = 0.18;
  const damp = c.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 1800;
  tone.connect(delay);
  delay.connect(damp).connect(feedback).connect(delay);
  damp.connect(wet).connect(master);

  bus = tone;
}

export async function start() {
  if (!ctx) {
    ctx = new AudioContext();
    build(ctx);
  }
  await ctx.resume();
  const now = ctx.currentTime;
  master!.gain.cancelScheduledValues(now);
  master!.gain.setTargetAtTime(0.8, now, 0.05);

  if (cleanup) return;

  // Notes on landings, an arpeggio on celebrations.
  let last: Reaction | null = null;
  const unsub = dot.subscribe(() => {
    const r = dot.getSnapshot().reaction;
    if (r === last) return;
    last = r;
    if (!r || !ctx || !bus) return;
    const t = ctx.currentTime;
    if (r === "celebrate") arpeggio(ctx, bus, t + 0.4);
    else LANDINGS[r]?.forEach((d) => land(t + d));
  });
  // Hand-off flights between spots.
  const offCue = dot.onCue((cue) => {
    if (cue === "land" && ctx) land(ctx.currentTime);
  });

  // Once at the summit.
  let summitPlayed = false;
  const summit = document.querySelector('[data-stage="7"]');
  const io = summit
    ? new IntersectionObserver(
        ([e]) => {
          if (e?.isIntersecting && !summitPlayed && ctx && bus) {
            summitPlayed = true;
            arpeggio(ctx, bus, ctx.currentTime + 0.1);
          }
        },
        { threshold: 0.5 },
      )
    : null;
  if (summit) io!.observe(summit);

  cleanup = () => {
    unsub();
    offCue();
    io?.disconnect();
    cleanup = null;
  };
}

export function stop() {
  cleanup?.();
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setTargetAtTime(0, now, 0.1);
  window.setTimeout(() => void ctx?.suspend(), 500);
}
