import { Button } from "@/components/ui/button";
import { Square, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "Memes" | "Animals" | "Effects" | "Music";

interface SoundButton {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  url: string;
}

// ─── Sound Data ───────────────────────────────────────────────────────────────

const SOUNDS: SoundButton[] = [
  // Memes
  {
    id: "airhorn",
    name: "Air Horn",
    emoji: "📯",
    category: "Memes",
    url: "https://www.soundjay.com/misc/sounds/air-horn-1.mp3",
  },
  {
    id: "fail",
    name: "Fail Buzzer",
    emoji: "❌",
    category: "Memes",
    url: "https://www.soundjay.com/misc/sounds/fail-buzzer-01.mp3",
  },
  {
    id: "applause",
    name: "Applause",
    emoji: "👏",
    category: "Memes",
    url: "https://www.soundjay.com/human/sounds/applause-01.mp3",
  },
  {
    id: "laugh",
    name: "Laugh Track",
    emoji: "😂",
    category: "Memes",
    url: "https://www.soundjay.com/human/sounds/laughing-01.mp3",
  },
  {
    id: "clap",
    name: "Clapping",
    emoji: "🎉",
    category: "Memes",
    url: "https://www.soundjay.com/human/sounds/clapping-01.mp3",
  },
  {
    id: "cash",
    name: "Cash Register",
    emoji: "💵",
    category: "Memes",
    url: "https://www.soundjay.com/misc/sounds/cash-register-1.mp3",
  },
  {
    id: "buzzer",
    name: "Buzzer",
    emoji: "🚨",
    category: "Memes",
    url: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3",
  },
  {
    id: "drumroll",
    name: "Drum Roll",
    emoji: "🥁",
    category: "Memes",
    url: "https://www.soundjay.com/misc/sounds/drum-roll-1.mp3",
  },
  // Animals
  {
    id: "dog",
    name: "Dog Bark",
    emoji: "🐕",
    category: "Animals",
    url: "https://www.soundjay.com/animals/sounds/dog-bark-1.mp3",
  },
  {
    id: "cat",
    name: "Cat Meow",
    emoji: "🐱",
    category: "Animals",
    url: "https://www.soundjay.com/animals/sounds/cat-meow-1.mp3",
  },
  {
    id: "duck",
    name: "Duck Quack",
    emoji: "🦆",
    category: "Animals",
    url: "https://www.soundjay.com/animals/sounds/duck-quacking-1.mp3",
  },
  {
    id: "cow",
    name: "Cow Moo",
    emoji: "🐄",
    category: "Animals",
    url: "https://www.soundjay.com/animals/sounds/cow-1.mp3",
  },
  {
    id: "horse",
    name: "Horse Neigh",
    emoji: "🐴",
    category: "Animals",
    url: "https://www.soundjay.com/animals/sounds/horse-1.mp3",
  },
  {
    id: "frog",
    name: "Frog",
    emoji: "🐸",
    category: "Animals",
    url: "https://www.soundjay.com/animals/sounds/frog-1.mp3",
  },
  // Effects
  {
    id: "explosion",
    name: "Explosion",
    emoji: "💥",
    category: "Effects",
    url: "https://www.soundjay.com/misc/sounds/explosion-01.mp3",
  },
  {
    id: "gunshot",
    name: "Gun Shot",
    emoji: "🔫",
    category: "Effects",
    url: "https://www.soundjay.com/misc/sounds/gun-gunshot-01.mp3",
  },
  {
    id: "thunder",
    name: "Thunder",
    emoji: "⛈️",
    category: "Effects",
    url: "https://www.soundjay.com/nature/sounds/thunder-02.mp3",
  },
  {
    id: "rain",
    name: "Rain",
    emoji: "🌧️",
    category: "Effects",
    url: "https://www.soundjay.com/nature/sounds/rain-01.mp3",
  },
  {
    id: "beep",
    name: "Beep",
    emoji: "📟",
    category: "Effects",
    url: "https://www.soundjay.com/misc/sounds/beep-01.mp3",
  },
  {
    id: "bell",
    name: "Bell",
    emoji: "🔔",
    category: "Effects",
    url: "https://www.soundjay.com/misc/sounds/bells-1.mp3",
  },
  // Music
  {
    id: "piano",
    name: "Piano",
    emoji: "🎹",
    category: "Music",
    url: "https://www.soundjay.com/music/sounds/piano-1.mp3",
  },
  {
    id: "guitar",
    name: "Guitar",
    emoji: "🎸",
    category: "Music",
    url: "https://www.soundjay.com/music/sounds/electric-guitar-1.mp3",
  },
  {
    id: "drum",
    name: "Drum Hit",
    emoji: "🥁",
    category: "Music",
    url: "https://www.soundjay.com/music/sounds/drum-1.mp3",
  },
  {
    id: "xylophone",
    name: "Xylophone",
    emoji: "🎵",
    category: "Music",
    url: "https://www.soundjay.com/music/sounds/xylophone-1.mp3",
  },
];

const CATEGORIES: Category[] = ["Memes", "Animals", "Effects", "Music"];

const CATEGORY_CONFIG: Record<
  Category,
  { color: string; bg: string; border: string; glow: string; headerBg: string }
> = {
  Memes: {
    color: "text-sound-meme",
    bg: "bg-sound-meme/10",
    border: "border-sound-meme/30",
    glow: "shadow-sound-meme",
    headerBg: "bg-sound-meme/15",
  },
  Animals: {
    color: "text-sound-animal",
    bg: "bg-sound-animal/10",
    border: "border-sound-animal/30",
    glow: "shadow-sound-animal",
    headerBg: "bg-sound-animal/15",
  },
  Effects: {
    color: "text-sound-effect",
    bg: "bg-sound-effect/10",
    border: "border-sound-effect/30",
    glow: "shadow-sound-effect",
    headerBg: "bg-sound-effect/15",
  },
  Music: {
    color: "text-sound-music",
    bg: "bg-sound-music/10",
    border: "border-sound-music/30",
    glow: "shadow-sound-music",
    headerBg: "bg-sound-music/15",
  },
};

const ALL_FILTER = "All";
type FilterOption = Category | typeof ALL_FILTER;

// ─── Sound Button Component ───────────────────────────────────────────────────

interface SoundBtnProps {
  sound: SoundButton;
  index: number;
  isPlaying: boolean;
  hasError: boolean;
  onClick: (sound: SoundButton) => void;
}

function SoundBtn({
  sound,
  index,
  isPlaying,
  hasError,
  onClick,
}: SoundBtnProps) {
  const cfg = CATEGORY_CONFIG[sound.category];

  return (
    <motion.button
      data-ocid={`sound.item.${index}`}
      type="button"
      aria-label={`Play ${sound.name}`}
      aria-pressed={isPlaying}
      onClick={() => onClick(sound)}
      className={[
        "relative group flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center",
        "transition-all duration-200 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        cfg.bg,
        cfg.border,
        "border",
        isPlaying
          ? `${cfg.color} ring-2 ring-offset-1 ring-offset-background scale-[0.97]`
          : "text-foreground hover:scale-[1.04] hover:brightness-125 active:scale-[0.97]",
        hasError ? "opacity-40 cursor-not-allowed" : "",
      ].join(" ")}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.5) }}
      whileTap={hasError ? {} : { scale: 0.93 }}
    >
      {/* Pulsing ring for playing state */}
      <AnimatePresence>
        {isPlaying && (
          <motion.span
            className={`absolute inset-0 rounded-2xl ${cfg.border} border-2 pointer-events-none`}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.9,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        )}
      </AnimatePresence>

      {/* Emoji */}
      <span
        className={[
          "text-3xl transition-transform duration-200 leading-none",
          isPlaying ? "scale-110" : "group-hover:scale-110",
        ].join(" ")}
        aria-hidden="true"
      >
        {sound.emoji}
      </span>

      {/* Name */}
      <span
        className={`text-xs font-semibold leading-tight ${isPlaying ? cfg.color : "text-muted-foreground group-hover:text-foreground"} transition-colors`}
      >
        {sound.name}
      </span>

      {/* Playing indicator */}
      {isPlaying && (
        <motion.span
          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center`}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </motion.span>
      )}

      {/* Error indicator */}
      {hasError && (
        <span
          className="absolute top-1.5 right-1.5 text-[10px]"
          title="Sound unavailable"
        >
          ⚠️
        </span>
      )}
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SoundButtonsWorld() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterOption>(ALL_FILTER);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlayingId(null);
  }, []);

  const handleSoundClick = useCallback(
    (sound: SoundButton) => {
      if (errorIds.has(sound.id)) return;

      // Clicking already-playing sound — stop it
      if (playingId === sound.id) {
        stopAll();
        return;
      }

      // Stop current
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(sound.url);
      audioRef.current = audio;
      setPlayingId(sound.id);

      audio.play().catch(() => {
        setErrorIds((prev) => new Set([...prev, sound.id]));
        setPlayingId(null);
      });

      audio.addEventListener("ended", () => {
        setPlayingId((prev) => (prev === sound.id ? null : prev));
      });

      audio.addEventListener("error", () => {
        setErrorIds((prev) => new Set([...prev, sound.id]));
        setPlayingId((prev) => (prev === sound.id ? null : prev));
      });
    },
    [playingId, errorIds, stopAll],
  );

  const filteredSounds =
    activeFilter === ALL_FILTER
      ? SOUNDS
      : SOUNDS.filter((s) => s.category === activeFilter);

  const groupedSounds = CATEGORIES.reduce<Record<Category, SoundButton[]>>(
    (acc, cat) => {
      acc[cat] = filteredSounds.filter((s) => s.category === cat);
      return acc;
    },
    {} as Record<Category, SoundButton[]>,
  );

  // Running index for deterministic data-ocid markers
  let itemIndex = 0;

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* ─── Header row ─────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
            Sound Buttons <span className="text-sound-music">World</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click any button to play. Click again to stop.
          </p>
        </div>

        <Button
          data-ocid="sounds.stop_button"
          variant="outline"
          size="sm"
          onClick={stopAll}
          disabled={!playingId}
          className="flex items-center gap-2 border-border hover:bg-muted text-muted-foreground hover:text-foreground self-start sm:self-auto"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          Stop All
        </Button>
      </motion.div>

      {/* ─── Category filter pills ───────────────────────────────────── */}
      <nav
        role="tablist"
        aria-label="Sound categories"
        className="flex flex-wrap gap-2 mb-7"
      >
        {([ALL_FILTER, ...CATEGORIES] as FilterOption[]).map((filter) => {
          const isActive = activeFilter === filter;
          const cfg =
            filter !== ALL_FILTER ? CATEGORY_CONFIG[filter as Category] : null;
          return (
            <button
              key={filter}
              type="button"
              data-ocid="sounds.tab"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(filter)}
              className={[
                "relative px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? filter === ALL_FILTER
                    ? "bg-foreground text-background"
                    : `${cfg!.bg} ${cfg!.color} ${cfg!.border} border`
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent",
              ].join(" ")}
            >
              {filter !== ALL_FILTER && (
                <span className="mr-1.5" aria-hidden="true">
                  {
                    { Memes: "🎭", Animals: "🦁", Effects: "⚡", Music: "🎶" }[
                      filter as Category
                    ]
                  }
                </span>
              )}
              {filter}
            </button>
          );
        })}
      </nav>

      {/* ─── Playing status banner ───────────────────────────────────── */}
      <AnimatePresence>
        {playingId && (
          <motion.div
            className="mb-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sound-music/10 border border-sound-music/30"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Volume2 className="w-4 h-4 text-sound-music flex-shrink-0 animate-pulse" />
            <span className="text-sm text-sound-music font-medium">
              Now playing:{" "}
              <span className="font-bold">
                {SOUNDS.find((s) => s.id === playingId)?.emoji}{" "}
                {SOUNDS.find((s) => s.id === playingId)?.name}
              </span>
            </span>
            <button
              type="button"
              onClick={stopAll}
              className="ml-auto text-sound-music/60 hover:text-sound-music transition-colors"
              aria-label="Stop playback"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Sound grid by category ──────────────────────────────────── */}
      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const sounds = groupedSounds[cat];
          if (sounds.length === 0) return null;
          const cfg = CATEGORY_CONFIG[cat];

          return (
            <motion.section
              key={cat}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category header */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4 ${cfg.headerBg}`}
              >
                <span className="text-lg" aria-hidden="true">
                  {
                    { Memes: "🎭", Animals: "🦁", Effects: "⚡", Music: "🎶" }[
                      cat
                    ]
                  }
                </span>
                <h2
                  className={`text-sm font-bold uppercase tracking-widest ${cfg.color}`}
                >
                  {cat}
                </h2>
                <span className={`text-xs ${cfg.color} opacity-70 font-medium`}>
                  ({sounds.length})
                </span>
              </div>

              {/* Buttons grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {sounds.map((sound) => {
                  itemIndex += 1;
                  return (
                    <SoundBtn
                      key={sound.id}
                      sound={sound}
                      index={itemIndex}
                      isPlaying={playingId === sound.id}
                      hasError={errorIds.has(sound.id)}
                      onClick={handleSoundClick}
                    />
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* ─── Footer hint ────────────────────────────────────────────── */}
      <motion.p
        className="text-center text-xs text-muted-foreground/50 mt-10 pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {SOUNDS.length} sounds across {CATEGORIES.length} categories
      </motion.p>
    </main>
  );
}
