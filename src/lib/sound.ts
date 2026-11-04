// Matchday sound effects, synthesized with WebAudio so there are no files to
// download. Off by default; the visitor opts in via the scoreboard toggle.

export type Sfx = "whistle" | "goal" | "save";

const KEY = "matchday:sound";
let ctx: AudioContext | null = null;

export const soundEnabled = () => {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
};

export const setSoundEnabled = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
};

const audio = () => {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

const envelope = (
  gain: GainNode,
  start: number,
  peak: number,
  attack: number,
  release: number,
) => {
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
};

// Referee's pea whistle: a high tone with a fast trill, two short blasts.
const whistle = () => {
  const ac = audio();
  [0, 0.28].forEach((offset, i) => {
    const t = ac.currentTime + offset;
    const length = i === 0 ? 0.18 : 0.42;
    const osc = ac.createOscillator();
    const trill = ac.createOscillator();
    const trillDepth = ac.createGain();
    const gain = ac.createGain();
    osc.frequency.value = 2700;
    trill.frequency.value = 32;
    trillDepth.gain.value = 140;
    trill.connect(trillDepth).connect(osc.frequency);
    osc.connect(gain).connect(ac.destination);
    envelope(gain, t, 0.08, 0.02, length);
    osc.start(t);
    trill.start(t);
    osc.stop(t + length + 0.05);
    trill.stop(t + length + 0.05);
  });
};

// Crowd roar: band-passed noise that swells and fades.
const crowd = (peak: number, seconds: number) => {
  const ac = audio();
  const t = ac.currentTime;
  const buffer = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const noise = ac.createBufferSource();
  const band = ac.createBiquadFilter();
  const gain = ac.createGain();
  noise.buffer = buffer;
  band.type = "bandpass";
  band.frequency.value = 900;
  band.Q.value = 0.6;
  noise.connect(band).connect(gain).connect(ac.destination);
  envelope(gain, t, peak, seconds * 0.25, seconds * 0.75);
  noise.start(t);
};

// Keeper's gloves: a low thud.
const thud = () => {
  const ac = audio();
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  osc.connect(gain).connect(ac.destination);
  envelope(gain, t, 0.35, 0.005, 0.2);
  osc.start(t);
  osc.stop(t + 0.25);
};

export const play = (name: Sfx) => {
  if (!soundEnabled()) return;
  try {
    if (name === "whistle") whistle();
    if (name === "goal") crowd(0.35, 1.8);
    if (name === "save") {
      thud();
      crowd(0.12, 0.9);
    }
  } catch {}
};

export const initSound = () => {
  document.addEventListener("matchday:sfx", (e) =>
    play((e as CustomEvent<Sfx>).detail),
  );
  document.addEventListener("matchday:kickoff", () => play("whistle"));
};
