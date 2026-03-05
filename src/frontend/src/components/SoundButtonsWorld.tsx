import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Heart, Search, Square, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "Memes" | "Animals" | "Effects" | "Music" | "UI";
type FilterTab = Category | "All" | "Favorites";

interface SoundDef {
  id: string;
  name: string;
  emoji: string;
  category: Category;
}

// ─── Sound Definitions ────────────────────────────────────────────────────────

const SOUNDS: SoundDef[] = [
  // Memes (12)
  { id: "airhorn", name: "Air Horn", emoji: "📯", category: "Memes" },
  { id: "sad_trombone", name: "Sad Trombone", emoji: "🎺", category: "Memes" },
  { id: "fail_buzzer", name: "Fail Buzzer", emoji: "❌", category: "Memes" },
  { id: "applause", name: "Applause", emoji: "👏", category: "Memes" },
  { id: "laugh", name: "Laugh Track", emoji: "😂", category: "Memes" },
  {
    id: "cash_register",
    name: "Cash Register",
    emoji: "💵",
    category: "Memes",
  },
  { id: "drum_roll", name: "Drum Roll", emoji: "🥁", category: "Memes" },
  { id: "wow", name: "WOW", emoji: "😮", category: "Memes" },
  { id: "bruh", name: "Bruh", emoji: "😐", category: "Memes" },
  { id: "oof", name: "Oof", emoji: "😬", category: "Memes" },
  { id: "vine_boom", name: "Vine Boom", emoji: "💥", category: "Memes" },
  { id: "windows_xp", name: "Windows XP", emoji: "🪟", category: "Memes" },
  // Animals (10)
  { id: "dog_bark", name: "Dog Bark", emoji: "🐕", category: "Animals" },
  { id: "cat_meow", name: "Cat Meow", emoji: "🐱", category: "Animals" },
  { id: "duck_quack", name: "Duck Quack", emoji: "🦆", category: "Animals" },
  { id: "cow_moo", name: "Cow Moo", emoji: "🐄", category: "Animals" },
  { id: "horse_neigh", name: "Horse Neigh", emoji: "🐴", category: "Animals" },
  { id: "frog", name: "Ribbit", emoji: "🐸", category: "Animals" },
  { id: "elephant", name: "Elephant", emoji: "🐘", category: "Animals" },
  { id: "snake", name: "Snake Hiss", emoji: "🐍", category: "Animals" },
  { id: "chicken", name: "Chicken Cluck", emoji: "🐔", category: "Animals" },
  { id: "lion", name: "Lion Roar", emoji: "🦁", category: "Animals" },
  // Effects (10)
  { id: "explosion", name: "Explosion", emoji: "💣", category: "Effects" },
  { id: "laser", name: "Laser", emoji: "🔴", category: "Effects" },
  { id: "power_up", name: "Power Up", emoji: "⬆️", category: "Effects" },
  { id: "magic", name: "Magic Sparkle", emoji: "✨", category: "Effects" },
  { id: "thunder", name: "Thunder", emoji: "⛈️", category: "Effects" },
  { id: "beep", name: "Beep", emoji: "📟", category: "Effects" },
  { id: "bell", name: "Bell", emoji: "🔔", category: "Effects" },
  { id: "robot", name: "Robot Beep", emoji: "🤖", category: "Effects" },
  { id: "glitch", name: "Glitch", emoji: "📺", category: "Effects" },
  { id: "whoosh", name: "Whoosh", emoji: "💨", category: "Effects" },
  // Music (8)
  { id: "piano_c", name: "Piano C", emoji: "🎹", category: "Music" },
  { id: "piano_chord", name: "Piano Chord", emoji: "🎵", category: "Music" },
  { id: "guitar_strum", name: "Guitar Strum", emoji: "🎸", category: "Music" },
  { id: "drum_kick", name: "Kick Drum", emoji: "🥁", category: "Music" },
  { id: "drum_snare", name: "Snare", emoji: "🪘", category: "Music" },
  { id: "bass_drop", name: "Bass Drop", emoji: "🔊", category: "Music" },
  { id: "xylophone", name: "Xylophone", emoji: "🎼", category: "Music" },
  { id: "trumpet_fanfare", name: "Fanfare", emoji: "🎺", category: "Music" },
  // UI (6)
  { id: "click_soft", name: "Soft Click", emoji: "🖱️", category: "UI" },
  { id: "click_hard", name: "Hard Click", emoji: "⌨️", category: "UI" },
  { id: "success", name: "Success", emoji: "✅", category: "UI" },
  { id: "error_tone", name: "Error", emoji: "🚫", category: "UI" },
  { id: "notification", name: "Notification", emoji: "🔔", category: "UI" },
  { id: "pop", name: "Pop", emoji: "🫧", category: "UI" },
];

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  Category,
  {
    color: string;
    bg: string;
    border: string;
    shadow: string;
    glow: string;
    emoji: string;
    label: string;
  }
> = {
  Memes: {
    color: "text-sound-meme",
    bg: "bg-sound-meme/10",
    border: "border-sound-meme/30",
    shadow: "shadow-sound-meme",
    glow: "var(--sound-playing-glow-meme)",
    emoji: "🎭",
    label: "Memes",
  },
  Animals: {
    color: "text-sound-animal",
    bg: "bg-sound-animal/10",
    border: "border-sound-animal/30",
    shadow: "shadow-sound-animal",
    glow: "var(--sound-playing-glow-animal)",
    emoji: "🦁",
    label: "Animals",
  },
  Effects: {
    color: "text-sound-effect",
    bg: "bg-sound-effect/10",
    border: "border-sound-effect/30",
    shadow: "shadow-sound-effect",
    glow: "var(--sound-playing-glow-effect)",
    emoji: "⚡",
    label: "Effects",
  },
  Music: {
    color: "text-sound-music",
    bg: "bg-sound-music/10",
    border: "border-sound-music/30",
    shadow: "shadow-sound-music",
    glow: "var(--sound-playing-glow-music)",
    emoji: "🎶",
    label: "Music",
  },
  UI: {
    color: "text-sound-ui",
    bg: "bg-sound-ui/10",
    border: "border-sound-ui/30",
    shadow: "shadow-sound-ui",
    glow: "var(--sound-playing-glow-ui)",
    emoji: "🖥️",
    label: "UI",
  },
};

const CATEGORIES: Category[] = ["Memes", "Animals", "Effects", "Music", "UI"];
const ALL_TABS: FilterTab[] = ["All", ...CATEGORIES, "Favorites"];

// ─── Web Audio Synthesis Engine ───────────────────────────────────────────────

function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function scheduleNoise(
  ctx: AudioContext,
  gain: GainNode,
  duration: number,
  lpFreq?: number,
  hpFreq?: number,
): void {
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx, duration);

  let node: AudioNode = src;

  if (hpFreq) {
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = hpFreq;
    node.connect(hp);
    node = hp;
  }
  if (lpFreq) {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = lpFreq;
    node.connect(lp);
    node = lp;
  }

  node.connect(gain);
  src.start(ctx.currentTime);
  src.stop(ctx.currentTime + duration);
}

function synthesize(ctx: AudioContext, soundId: string, volume: number): void {
  const t = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, t);
  masterGain.connect(ctx.destination);

  const osc = (
    freq: number,
    type: OscillatorType,
    startT: number,
    endT: number,
    gainPeak: number,
    freqEnd?: number,
  ) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, startT);
    if (freqEnd !== undefined) {
      o.frequency.linearRampToValueAtTime(freqEnd, endT);
    }
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(gainPeak, startT + 0.01);
    g.gain.linearRampToValueAtTime(0, endT);
    o.connect(g);
    g.connect(masterGain);
    o.start(startT);
    o.stop(endT + 0.05);
  };

  switch (soundId) {
    // ─── MEMES ──────────────────────────────────────────────────────────────
    case "airhorn": {
      // Sawtooth sweep 400→1200Hz, 0.8s, heavy distortion via gain
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.8);
      const wave = ctx.createOscillator();
      wave.type = "sawtooth";
      wave.frequency.setValueAtTime(400, t);
      wave.frequency.linearRampToValueAtTime(1200, t + 0.8);
      // Waveshaper for distortion
      const ws = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = ((Math.PI + 200) * x) / (Math.PI + 200 * Math.abs(x));
      }
      ws.curve = curve;
      wave.connect(ws);
      ws.connect(g);
      g.connect(masterGain);
      wave.start(t);
      wave.stop(t + 0.85);
      break;
    }
    case "sad_trombone": {
      // Descending Bb→F over 1.2s (Bb4=466Hz, A4=440Hz, G4=392Hz, F4=349Hz)
      const steps = [466, 440, 392, 349];
      for (let i = 0; i < steps.length; i++) {
        osc(steps[i], "sine", t + i * 0.3, t + i * 0.3 + 0.35, 0.5);
      }
      break;
    }
    case "fail_buzzer": {
      // Square 200Hz + tremolo 0.6s
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 14;
      lfoGain.gain.value = 0.4;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      g.gain.setValueAtTime(0.5, t);
      g.gain.linearRampToValueAtTime(0, t + 0.6);
      const wave = ctx.createOscillator();
      wave.type = "square";
      wave.frequency.value = 200;
      wave.connect(g);
      g.connect(masterGain);
      lfo.start(t);
      lfo.stop(t + 0.65);
      wave.start(t);
      wave.stop(t + 0.65);
      break;
    }
    case "applause": {
      // Filtered white noise burst 1.5s fade in/out
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.6, t + 0.5);
      g.gain.linearRampToValueAtTime(0, t + 1.5);
      g.connect(masterGain);
      scheduleNoise(ctx, g, 1.6, 3500, 200);
      break;
    }
    case "laugh": {
      // Modulated sine 300→400Hz rapid oscillation 1s
      for (let i = 0; i < 6; i++) {
        const start = t + i * 0.16;
        osc(300 + i * 16, "sine", start, start + 0.12, 0.5);
      }
      break;
    }
    case "cash_register": {
      // High ping 1800Hz + click
      osc(1800, "sine", t, t + 0.3, 0.6);
      osc(900, "sine", t + 0.05, t + 0.15, 0.3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t + 0.02);
      g.gain.linearRampToValueAtTime(0, t + 0.06);
      g.connect(masterGain);
      scheduleNoise(ctx, g, 0.06, 2000);
      break;
    }
    case "drum_roll": {
      // Rapid noise hits 20/sec for 1s
      for (let i = 0; i < 20; i++) {
        const hitT = t + i * 0.05;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5, hitT);
        g.gain.linearRampToValueAtTime(0, hitT + 0.04);
        g.connect(masterGain);
        scheduleNoise(ctx, g, 0.05, 300);
      }
      break;
    }
    case "wow": {
      // Descending sine 800→200Hz portamento 0.8s
      osc(800, "sine", t, t + 0.8, 0.7, 200);
      break;
    }
    case "bruh": {
      // Low sine 90Hz slight pitch drop 0.5s
      osc(90, "sine", t, t + 0.5, 0.8, 70);
      break;
    }
    case "oof": {
      // Descending sawtooth 300→150Hz 0.4s
      osc(300, "sawtooth", t, t + 0.4, 0.6, 150);
      break;
    }
    case "vine_boom": {
      // Sub-bass 60Hz with slow fade tail 0.7s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.setValueAtTime(60, t);
      wave.frequency.exponentialRampToValueAtTime(20, t + 0.7);
      wave.connect(g);
      g.connect(masterGain);
      wave.start(t);
      wave.stop(t + 0.75);
      break;
    }
    case "windows_xp": {
      // Ascending 3-note chord C4→E4→G4 arpeggiated
      const notes = [261.6, 329.6, 392];
      for (let i = 0; i < notes.length; i++) {
        osc(notes[i], "sine", t + i * 0.22, t + i * 0.22 + 0.45, 0.45);
      }
      break;
    }

    // ─── ANIMALS ────────────────────────────────────────────────────────────
    case "dog_bark": {
      // Noise burst filtered at 800Hz with pitch envelope 0.4s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7, t);
      g.gain.linearRampToValueAtTime(0, t + 0.4);
      g.connect(masterGain);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(800, t);
      bp.frequency.linearRampToValueAtTime(400, t + 0.4);
      bp.Q.value = 2;
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, 0.45);
      src.connect(bp);
      bp.connect(g);
      src.start(t);
      src.stop(t + 0.45);
      // Add short bark click
      osc(220, "sawtooth", t, t + 0.1, 0.4, 120);
      break;
    }
    case "cat_meow": {
      // Sine 500→700→500Hz slow modulation 0.6s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.55, t + 0.1);
      g.gain.linearRampToValueAtTime(0.4, t + 0.5);
      g.gain.linearRampToValueAtTime(0, t + 0.65);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.setValueAtTime(500, t);
      wave.frequency.linearRampToValueAtTime(700, t + 0.25);
      wave.frequency.linearRampToValueAtTime(500, t + 0.6);
      wave.connect(g);
      g.connect(masterGain);
      wave.start(t);
      wave.stop(t + 0.7);
      break;
    }
    case "duck_quack": {
      // Sawtooth 300Hz with wah filter 0.3s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, t);
      g.gain.linearRampToValueAtTime(0, t + 0.3);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(800, t);
      bp.frequency.linearRampToValueAtTime(300, t + 0.3);
      bp.Q.value = 3;
      const wave = ctx.createOscillator();
      wave.type = "sawtooth";
      wave.frequency.value = 300;
      wave.connect(bp);
      bp.connect(g);
      g.connect(masterGain);
      wave.start(t);
      wave.stop(t + 0.35);
      break;
    }
    case "cow_moo": {
      // Low sine 120Hz with vibrato 1s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.65, t + 0.15);
      g.gain.linearRampToValueAtTime(0.5, t + 0.8);
      g.gain.linearRampToValueAtTime(0, t + 1.0);
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 5;
      lfoG.gain.value = 8;
      lfo.connect(lfoG);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.value = 120;
      lfoG.connect(wave.frequency);
      wave.connect(g);
      g.connect(masterGain);
      lfo.start(t);
      lfo.stop(t + 1.05);
      wave.start(t);
      wave.stop(t + 1.05);
      break;
    }
    case "horse_neigh": {
      // Ascending sawtooth 400→1200Hz 0.8s
      osc(400, "sawtooth", t, t + 0.8, 0.55, 1200);
      break;
    }
    case "frog": {
      // Square 200Hz double-pulse 0.4s
      osc(200, "square", t, t + 0.12, 0.5);
      osc(200, "square", t + 0.2, t + 0.38, 0.5);
      break;
    }
    case "elephant": {
      // Sine sweep 150→600Hz 0.8s
      osc(150, "sine", t, t + 0.8, 0.7, 600);
      break;
    }
    case "snake": {
      // High-passed white noise 2000Hz 0.7s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.6);
      g.gain.linearRampToValueAtTime(0, t + 0.7);
      g.connect(masterGain);
      scheduleNoise(ctx, g, 0.75, undefined, 2000);
      break;
    }
    case "chicken": {
      // Filtered noise 600Hz short pulse x2 0.3s
      for (let i = 0; i < 2; i++) {
        const start = t + i * 0.15;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5, start);
        g.gain.linearRampToValueAtTime(0, start + 0.1);
        g.connect(masterGain);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 600;
        bp.Q.value = 4;
        const src = ctx.createBufferSource();
        src.buffer = createNoiseBuffer(ctx, 0.12);
        src.connect(bp);
        bp.connect(g);
        src.start(start);
        src.stop(start + 0.12);
      }
      break;
    }
    case "lion": {
      // Sawtooth 80Hz LFO modulation 1.2s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.7, t + 0.2);
      g.gain.linearRampToValueAtTime(0.6, t + 1.0);
      g.gain.linearRampToValueAtTime(0, t + 1.2);
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 3;
      lfoG.gain.value = 25;
      lfo.connect(lfoG);
      const wave = ctx.createOscillator();
      wave.type = "sawtooth";
      wave.frequency.value = 80;
      lfoG.connect(wave.frequency);
      wave.connect(g);
      g.connect(masterGain);
      lfo.start(t);
      lfo.stop(t + 1.25);
      wave.start(t);
      wave.stop(t + 1.25);
      break;
    }

    // ─── EFFECTS ────────────────────────────────────────────────────────────
    case "explosion": {
      // Filtered noise sweep downward 500→50Hz 1.2s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, t);
      g.gain.linearRampToValueAtTime(0, t + 1.2);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(500, t);
      lp.frequency.linearRampToValueAtTime(50, t + 1.2);
      g.connect(masterGain);
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, 1.25);
      src.connect(lp);
      lp.connect(g);
      src.start(t);
      src.stop(t + 1.25);
      break;
    }
    case "laser": {
      // Sine sweep 2000→400Hz fast 0.4s
      osc(2000, "sine", t, t + 0.4, 0.7, 400);
      break;
    }
    case "power_up": {
      // Ascending arpeggio C→E→G→C5 (261,329,392,523Hz)
      const powerNotes = [261.6, 329.6, 392, 523.25];
      for (let i = 0; i < powerNotes.length; i++) {
        osc(powerNotes[i], "sine", t + i * 0.12, t + i * 0.12 + 0.18, 0.55);
      }
      break;
    }
    case "magic": {
      // High sine 2000Hz shimmer LFO tremolo 0.7s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.linearRampToValueAtTime(0, t + 0.7);
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 20;
      lfoG.gain.value = 0.3;
      lfo.connect(lfoG);
      lfoG.connect(g.gain);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.value = 2000;
      wave.connect(g);
      g.connect(masterGain);
      lfo.start(t);
      lfo.stop(t + 0.75);
      wave.start(t);
      wave.stop(t + 0.75);
      break;
    }
    case "thunder": {
      // Low noise burst with rumble 1.5s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.8, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.3);
      g.gain.linearRampToValueAtTime(0.6, t + 0.6);
      g.gain.linearRampToValueAtTime(0, t + 1.5);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 200;
      g.connect(masterGain);
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, 1.55);
      src.connect(lp);
      lp.connect(g);
      src.start(t);
      src.stop(t + 1.55);
      break;
    }
    case "beep": {
      // Pure sine 1000Hz short 0.2s
      osc(1000, "sine", t, t + 0.2, 0.6);
      break;
    }
    case "bell": {
      // Sine 880Hz with long decay 1.5s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.value = 880;
      wave.connect(g);
      g.connect(masterGain);
      wave.start(t);
      wave.stop(t + 1.55);
      // Add partial harmonic
      osc(1760, "sine", t, t + 0.8, 0.2);
      break;
    }
    case "robot": {
      // Square 400Hz stepping LFO 0.5s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.linearRampToValueAtTime(0, t + 0.5);
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 8;
      lfoG.gain.value = 200;
      lfo.connect(lfoG);
      const wave = ctx.createOscillator();
      wave.type = "square";
      wave.frequency.value = 400;
      lfoG.connect(wave.frequency);
      wave.connect(g);
      g.connect(masterGain);
      lfo.start(t);
      lfo.stop(t + 0.55);
      wave.start(t);
      wave.stop(t + 0.55);
      break;
    }
    case "glitch": {
      // Rapid random noise bursts 0.6s
      for (let i = 0; i < 12; i++) {
        const start = t + Math.random() * 0.55;
        const dur = 0.02 + Math.random() * 0.04;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5 + Math.random() * 0.4, start);
        g.gain.linearRampToValueAtTime(0, start + dur);
        g.connect(masterGain);
        scheduleNoise(ctx, g, dur, 500 + Math.random() * 3000);
      }
      break;
    }
    case "whoosh": {
      // Noise sweep filtered 200→4000Hz 0.5s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.3, t);
      g.gain.linearRampToValueAtTime(0.7, t + 0.25);
      g.gain.linearRampToValueAtTime(0, t + 0.5);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(200, t);
      lp.frequency.linearRampToValueAtTime(4000, t + 0.5);
      g.connect(masterGain);
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, 0.55);
      src.connect(lp);
      lp.connect(g);
      src.start(t);
      src.stop(t + 0.55);
      break;
    }

    // ─── MUSIC ──────────────────────────────────────────────────────────────
    case "piano_c": {
      // Sine + harmonics 261Hz natural decay 1s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.value = 261.6;
      wave.connect(g);
      g.connect(masterGain);
      wave.start(t);
      wave.stop(t + 1.05);
      // Harmonics
      osc(523.25, "sine", t, t + 0.6, 0.2);
      osc(784, "sine", t, t + 0.4, 0.1);
      break;
    }
    case "piano_chord": {
      // C major triad C+E+G
      const chordNotes: [number, number][] = [
        [261.6, 1.0],
        [329.6, 0.9],
        [392, 0.8],
      ];
      for (const [f, dec] of chordNotes) {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dec);
        const wave = ctx.createOscillator();
        wave.type = "sine";
        wave.frequency.value = f;
        wave.connect(g);
        g.connect(masterGain);
        wave.start(t);
        wave.stop(t + dec + 0.05);
      }
      break;
    }
    case "guitar_strum": {
      // Sawtooth chord C major quick decay 0.8s
      const strumFreqs = [196, 246.9, 293.7, 329.6, 392];
      for (let i = 0; i < strumFreqs.length; i++) {
        const start = t + i * 0.02;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.35, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.7);
        const wave = ctx.createOscillator();
        wave.type = "sawtooth";
        wave.frequency.value = strumFreqs[i];
        wave.connect(g);
        g.connect(masterGain);
        wave.start(start);
        wave.stop(start + 0.75);
      }
      break;
    }
    case "drum_kick": {
      // Sine 60→30Hz fast pitch drop + noise transient 0.3s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.setValueAtTime(60, t);
      wave.frequency.exponentialRampToValueAtTime(30, t + 0.15);
      wave.connect(g);
      g.connect(masterGain);
      wave.start(t);
      wave.stop(t + 0.35);
      // Click transient
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(0.6, t);
      cg.gain.linearRampToValueAtTime(0, t + 0.02);
      cg.connect(masterGain);
      scheduleNoise(ctx, cg, 0.02);
      break;
    }
    case "drum_snare": {
      // Noise burst with ring 0.2s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      g.connect(masterGain);
      scheduleNoise(ctx, g, 0.22, 3000, 200);
      osc(200, "sine", t, t + 0.1, 0.3);
      break;
    }
    case "bass_drop": {
      // Sub-bass 40Hz with delay effect 1s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, t);
      g.gain.linearRampToValueAtTime(0.7, t + 0.5);
      g.gain.linearRampToValueAtTime(0, t + 1.0);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.value = 40;
      wave.connect(g);
      g.connect(masterGain);
      wave.start(t);
      wave.stop(t + 1.05);
      // Delayed repeat
      osc(40, "sine", t + 0.3, t + 0.8, 0.4);
      break;
    }
    case "xylophone": {
      // Pure sine 800Hz wooden timbre 0.6s
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      const wave = ctx.createOscillator();
      wave.type = "sine";
      wave.frequency.value = 800;
      // Add slight inharmonic partial
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.15, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      const wave2 = ctx.createOscillator();
      wave2.type = "sine";
      wave2.frequency.value = 2140; // slightly inharmonic
      wave.connect(g);
      wave2.connect(g2);
      g.connect(masterGain);
      g2.connect(masterGain);
      wave.start(t);
      wave.stop(t + 0.65);
      wave2.start(t);
      wave2.stop(t + 0.25);
      break;
    }
    case "trumpet_fanfare": {
      // Ascending sawtooth 4-note motif 1s
      const fanfareNotes: [number, number][] = [
        [392, 0],
        [523.25, 0.25],
        [587.33, 0.5],
        [783.99, 0.7],
      ];
      for (const [f, delay] of fanfareNotes) {
        const start = t + delay;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.5, start + 0.04);
        g.gain.linearRampToValueAtTime(0.4, start + 0.22);
        g.gain.linearRampToValueAtTime(0, start + 0.28);
        const wave = ctx.createOscillator();
        wave.type = "sawtooth";
        wave.frequency.value = f;
        wave.connect(g);
        g.connect(masterGain);
        wave.start(start);
        wave.stop(start + 0.32);
      }
      break;
    }

    // ─── UI ─────────────────────────────────────────────────────────────────
    case "click_soft": {
      osc(1200, "sine", t, t + 0.02, 0.4);
      break;
    }
    case "click_hard": {
      osc(800, "square", t, t + 0.03, 0.5);
      break;
    }
    case "success": {
      const successNotes = [523.25, 659.25, 783.99];
      for (let i = 0; i < successNotes.length; i++) {
        osc(successNotes[i], "sine", t + i * 0.1, t + i * 0.1 + 0.18, 0.5);
      }
      break;
    }
    case "error_tone": {
      osc(440, "square", t, t + 0.15, 0.4);
      osc(330, "square", t + 0.18, t + 0.38, 0.4);
      break;
    }
    case "notification": {
      osc(1400, "sine", t, t + 0.12, 0.5);
      osc(1400, "sine", t + 0.15, t + 0.27, 0.4);
      break;
    }
    case "pop": {
      osc(600, "sine", t, t + 0.05, 0.7, 900);
      break;
    }
    default:
      osc(440, "sine", t, t + 0.3, 0.5);
  }
}

// ─── useSoundEngine hook ──────────────────────────────────────────────────────

function useSoundEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [volume, setVolumeState] = useState(0.75);
  const volumeRef = useRef(0.75);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (soundId: string): void => {
      const ctx = getCtx();
      synthesize(ctx, soundId, volumeRef.current);
    },
    [getCtx],
  );

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);
  }, []);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return { play, volume, setVolume };
}

// ─── Waveform Animation ───────────────────────────────────────────────────────

function WaveformBars({ color }: { color: string }) {
  return (
    <div className={`flex items-end gap-[2px] h-4 ${color}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-current soundbar-${i}`}
          style={{ height: "100%", transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

// ─── Sound Card ───────────────────────────────────────────────────────────────

interface SoundCardProps {
  sound: SoundDef;
  index: number;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: (id: string) => void;
  onFavorite: (id: string) => void;
}

function SoundCard({
  sound,
  index,
  isPlaying,
  isFavorite,
  onPlay,
  onFavorite,
}: SoundCardProps) {
  const cfg = CATEGORY_CONFIG[sound.category];

  return (
    <motion.div
      data-ocid={`soundboard.sound.item.${index}`}
      className="relative group"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.28,
        delay: Math.min(index * 0.02, 0.5),
        type: "spring",
        stiffness: 320,
        damping: 22,
      }}
    >
      {/* Card button */}
      <button
        type="button"
        aria-label={`Play ${sound.name}`}
        aria-pressed={isPlaying}
        onClick={() => onPlay(sound.id)}
        className={[
          "w-full min-h-[108px] flex flex-col items-center justify-center gap-2 rounded-2xl p-3",
          "transition-all duration-200 cursor-pointer select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "border",
          isPlaying
            ? `${cfg.bg} ${cfg.border} ${cfg.color} scale-[0.96]`
            : `bg-sound-card border-border/50 hover:${cfg.bg} hover:${cfg.border} text-foreground`,
        ].join(" ")}
        style={{
          boxShadow: isPlaying ? cfg.glow : undefined,
          transition:
            "box-shadow 0.2s, transform 0.15s, background 0.2s, border-color 0.2s",
        }}
      >
        {/* Emoji */}
        <span
          className={[
            "text-3xl leading-none transition-transform duration-200",
            isPlaying ? "scale-110" : "group-hover:scale-110",
          ].join(" ")}
          aria-hidden="true"
        >
          {sound.emoji}
        </span>

        {/* Name */}
        <span
          className={[
            "text-[11px] font-semibold leading-tight text-center px-1",
            isPlaying
              ? cfg.color
              : "text-muted-foreground group-hover:text-foreground",
          ].join(" ")}
        >
          {sound.name}
        </span>

        {/* Waveform or playing dot */}
        {isPlaying ? (
          <WaveformBars color={cfg.color} />
        ) : (
          <span className="h-4" aria-hidden="true" />
        )}
      </button>

      {/* Favorite button */}
      <button
        type="button"
        data-ocid={`soundboard.favorite.button.${index}`}
        aria-label={
          isFavorite
            ? `Remove ${sound.name} from favorites`
            : `Add ${sound.name} to favorites`
        }
        aria-pressed={isFavorite}
        onClick={(e) => {
          e.stopPropagation();
          onFavorite(sound.id);
        }}
        className={[
          "absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full",
          "transition-all duration-150 opacity-0 group-hover:opacity-100",
          isFavorite
            ? "opacity-100 text-sound-fav"
            : "text-muted-foreground/50 hover:text-sound-fav",
        ].join(" ")}
      >
        <Heart
          className="w-3.5 h-3.5"
          fill={isFavorite ? "currentColor" : "none"}
        />
      </button>

      {/* Pulsing glow ring for playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.span
            className={`absolute inset-0 rounded-2xl pointer-events-none border ${cfg.border}`}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.0,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Recently Played Strip ────────────────────────────────────────────────────

function RecentlyPlayed({
  recentIds,
  playingId,
  onPlay,
}: {
  recentIds: string[];
  playingId: string | null;
  onPlay: (id: string) => void;
}) {
  if (recentIds.length === 0) return null;

  return (
    <motion.div
      data-ocid="soundboard.recent.panel"
      className="mb-5 rounded-2xl border border-border/50 bg-sound-surface/60 backdrop-blur-sm p-3"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
        Recently Played
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {recentIds.map((id) => {
          const sound = SOUNDS.find((s) => s.id === id);
          if (!sound) return null;
          const cfg = CATEGORY_CONFIG[sound.category];
          const playing = playingId === id;
          return (
            <button
              key={id}
              type="button"
              aria-label={`Replay ${sound.name}`}
              onClick={() => onPlay(id)}
              className={[
                "flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                playing
                  ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                  : "bg-sound-card border-border/40 text-muted-foreground hover:text-foreground hover:border-border",
              ].join(" ")}
            >
              <span className="text-xl leading-none">{sound.emoji}</span>
              <span className="text-[10px] font-medium whitespace-nowrap">
                {sound.name}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

interface TabBtnProps {
  tab: FilterTab;
  active: boolean;
  count: number;
  ocid: string;
  onClick: () => void;
}

function TabBtn({ tab, active, count, ocid, onClick }: TabBtnProps) {
  const isAll = tab === "All";
  const isFav = tab === "Favorites";
  const cfg = !isAll && !isFav ? CATEGORY_CONFIG[tab as Category] : null;

  const emoji = isFav
    ? "⭐"
    : isAll
      ? "🎛️"
      : CATEGORY_CONFIG[tab as Category].emoji;

  return (
    <button
      type="button"
      data-ocid={ocid}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "whitespace-nowrap",
        active
          ? isFav
            ? "bg-sound-fav/15 text-sound-fav border border-sound-fav/40"
            : isAll
              ? "bg-foreground/10 text-foreground border border-border"
              : `${cfg!.bg} ${cfg!.color} border ${cfg!.border}`
          : "bg-sound-card text-muted-foreground border border-border/40 hover:text-foreground hover:border-border",
      ].join(" ")}
    >
      <span className="text-base leading-none" aria-hidden="true">
        {emoji}
      </span>
      <span>{tab}</span>
      <span
        className={[
          "ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
          active
            ? isFav
              ? "bg-sound-fav/25"
              : isAll
                ? "bg-foreground/10"
                : `${cfg!.bg}`
            : "bg-muted/60",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FAVORITES_KEY = "soundboard_favorites";
const MAX_RECENT = 6;

const TAB_OCIDS: Record<FilterTab, string> = {
  All: "soundboard.all.tab",
  Memes: "soundboard.memes.tab",
  Animals: "soundboard.animals.tab",
  Effects: "soundboard.effects.tab",
  Music: "soundboard.music.tab",
  UI: "soundboard.ui.tab",
  Favorites: "soundboard.favorites.tab",
};

export default function SoundButtonsWorld() {
  const { play, volume, setVolume } = useSoundEngine();

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored
        ? new Set<string>(JSON.parse(stored) as string[])
        : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only if not typing in an input
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        setPlayingId(null);
        if (playTimerRef.current) clearTimeout(playTimerRef.current);
      }
      if (e.key >= "1" && e.key <= "5") {
        const tabs: FilterTab[] = [
          "All",
          "Memes",
          "Animals",
          "Effects",
          "Music",
        ];
        const idx = Number.parseInt(e.key) - 1;
        if (tabs[idx]) setActiveTab(tabs[idx]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handlePlay = useCallback(
    (soundId: string) => {
      if (playingId === soundId) {
        setPlayingId(null);
        if (playTimerRef.current) clearTimeout(playTimerRef.current);
        return;
      }
      play(soundId);
      setPlayingId(soundId);

      // Update recently played
      setRecentIds((prev) => {
        const filtered = prev.filter((id) => id !== soundId);
        return [soundId, ...filtered].slice(0, MAX_RECENT);
      });

      // Auto-clear playing state after estimated sound duration
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      playTimerRef.current = setTimeout(() => {
        setPlayingId((prev) => (prev === soundId ? null : prev));
      }, 2000);
    },
    [play, playingId],
  );

  const handleFavorite = useCallback((soundId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(soundId)) next.delete(soundId);
      else next.add(soundId);
      return next;
    });
  }, []);

  const handleStopAll = useCallback(() => {
    setPlayingId(null);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
  }, []);

  // Filtered sounds
  const filteredSounds = useMemo(() => {
    let list = SOUNDS;
    if (activeTab === "Favorites") {
      list = list.filter((s) => favorites.has(s.id));
    } else if (activeTab !== "All") {
      list = list.filter((s) => s.category === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, search, favorites]);

  // Tab counts
  const tabCounts = useMemo((): Record<FilterTab, number> => {
    const q = search.trim().toLowerCase();
    const matchSearch = (s: SoundDef) => !q || s.name.toLowerCase().includes(q);
    return {
      All: SOUNDS.filter(matchSearch).length,
      Memes: SOUNDS.filter((s) => s.category === "Memes" && matchSearch(s))
        .length,
      Animals: SOUNDS.filter((s) => s.category === "Animals" && matchSearch(s))
        .length,
      Effects: SOUNDS.filter((s) => s.category === "Effects" && matchSearch(s))
        .length,
      Music: SOUNDS.filter((s) => s.category === "Music" && matchSearch(s))
        .length,
      UI: SOUNDS.filter((s) => s.category === "UI" && matchSearch(s)).length,
      Favorites: SOUNDS.filter((s) => favorites.has(s.id) && matchSearch(s))
        .length,
    };
  }, [search, favorites]);

  // Group by category when on "All" tab (no search)
  const showGrouped = activeTab === "All" && !search.trim();

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              🎛️
            </span>
            Sound<span className="text-sound-music">board</span>
            <span className="text-xs font-medium text-muted-foreground bg-sound-card border border-border/60 px-2 py-0.5 rounded-full ml-1">
              {SOUNDS.length} sounds
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Web Audio synthesizer · no downloads needed
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Volume */}
          <div className="flex items-center gap-2 bg-sound-card border border-border/50 rounded-xl px-3 py-2 min-w-[160px]">
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-sound-music flex-shrink-0" />
            )}
            <Slider
              data-ocid="soundboard.volume.input"
              value={[Math.round(volume * 100)]}
              onValueChange={([v]) => setVolume(v / 100)}
              min={0}
              max={100}
              step={1}
              className="flex-1"
              aria-label="Volume"
            />
            <span className="text-xs font-mono text-muted-foreground w-8 text-right flex-shrink-0">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Stop All */}
          <Button
            data-ocid="soundboard.stop.button"
            variant="outline"
            size="sm"
            onClick={handleStopAll}
            disabled={!playingId}
            className="flex items-center gap-2 border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Stop All</span>
          </Button>
        </div>
      </motion.div>

      {/* ─── Search bar ────────────────────────────────────────────── */}
      <motion.div
        className="relative mb-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          data-ocid="soundboard.search.input"
          type="search"
          placeholder="Search sounds…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={[
            "w-full pl-10 pr-4 py-2.5 rounded-xl bg-sound-card border border-border/50",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-sound-music/50 focus:border-sound-music/40",
            "transition-all duration-200",
          ].join(" ")}
          aria-label="Search sounds"
        />
      </motion.div>

      {/* ─── Recently played ───────────────────────────────────────── */}
      <AnimatePresence>
        {recentIds.length > 0 && (
          <RecentlyPlayed
            recentIds={recentIds}
            playingId={playingId}
            onPlay={handlePlay}
          />
        )}
      </AnimatePresence>

      {/* ─── Category tabs ─────────────────────────────────────────── */}
      <motion.nav
        role="tablist"
        aria-label="Sound categories"
        className="flex flex-wrap gap-2 mb-6"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
      >
        {ALL_TABS.map((tab) => (
          <TabBtn
            key={tab}
            tab={tab}
            active={activeTab === tab}
            count={tabCounts[tab]}
            ocid={TAB_OCIDS[tab]}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </motion.nav>

      {/* ─── Now Playing banner ────────────────────────────────────── */}
      <AnimatePresence>
        {playingId && (
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
          >
            {(() => {
              const snd = SOUNDS.find((s) => s.id === playingId);
              if (!snd) return null;
              const cfg = CATEGORY_CONFIG[snd.category];
              return (
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}
                >
                  <WaveformBars color={cfg.color} />
                  <span className={`text-sm font-medium ${cfg.color}`}>
                    Now playing:{" "}
                    <span className="font-bold">
                      {snd.emoji} {snd.name}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleStopAll}
                    className={`ml-auto ${cfg.color} opacity-60 hover:opacity-100 transition-opacity`}
                    aria-label="Stop playback"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Sound grid ────────────────────────────────────────────── */}
      {filteredSounds.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-5xl mb-4" aria-hidden="true">
            {activeTab === "Favorites" ? "⭐" : "🔍"}
          </span>
          <p className="text-foreground font-semibold font-display mb-1">
            {activeTab === "Favorites" ? "No favorites yet" : "No sounds found"}
          </p>
          <p className="text-sm text-muted-foreground">
            {activeTab === "Favorites"
              ? "Click the ♡ on any sound to save it here."
              : "Try a different search term."}
          </p>
        </motion.div>
      ) : showGrouped ? (
        // Grouped by category
        <div className="space-y-8">
          {CATEGORIES.map((cat, catIdx) => {
            const sounds = SOUNDS.filter((s) => s.category === cat);
            const cfg = CATEGORY_CONFIG[cat];
            // Running index for ocid
            const baseIndex =
              CATEGORIES.slice(0, catIdx).reduce(
                (acc, c) => acc + SOUNDS.filter((s) => s.category === c).length,
                0,
              ) + 1;

            return (
              <motion.section
                key={cat}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: catIdx * 0.07 }}
              >
                {/* Category header */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4 ${cfg.bg} border ${cfg.border}`}
                >
                  <span className="text-lg" aria-hidden="true">
                    {cfg.emoji}
                  </span>
                  <h2
                    className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}
                  >
                    {cfg.label}
                  </h2>
                  <span
                    className={`text-xs ${cfg.color} opacity-60 font-medium`}
                  >
                    {sounds.length}
                  </span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {sounds.map((sound, i) => (
                    <SoundCard
                      key={sound.id}
                      sound={sound}
                      index={baseIndex + i}
                      isPlaying={playingId === sound.id}
                      isFavorite={favorites.has(sound.id)}
                      onPlay={handlePlay}
                      onFavorite={handleFavorite}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      ) : (
        // Flat grid (search, tab filter, favorites)
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredSounds.map((sound, i) => (
            <SoundCard
              key={sound.id}
              sound={sound}
              index={i + 1}
              isPlaying={playingId === sound.id}
              isFavorite={favorites.has(sound.id)}
              onPlay={handlePlay}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}

      {/* ─── Footer hint ───────────────────────────────────────────── */}
      <motion.p
        className="text-center text-xs text-muted-foreground/40 mt-10 pb-4 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        Space = stop · 1–5 = switch tab
      </motion.p>
    </main>
  );
}
