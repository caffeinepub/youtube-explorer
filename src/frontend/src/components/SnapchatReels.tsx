import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Reels Data ───────────────────────────────────────────────────────────────

interface Reel {
  id: string;
  username: string;
  handle: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  bgGradient: string;
  emoji: string;
  videoEmoji: string;
  sound: string;
  duration: number;
}

const REELS: Reel[] = [
  {
    id: "r1",
    username: "KashVibes",
    handle: "@kashvibes",
    description: "Bro found the cheat code to life 😭🔥 #fyp #viral",
    likes: 142300,
    comments: 4820,
    shares: 9100,
    bgGradient:
      "linear-gradient(160deg, #ff6a00 0%, #ee0979 60%, #1a1a2e 100%)",
    emoji: "🔥",
    videoEmoji: "😭",
    sound: "Original Sound - KashVibes",
    duration: 15,
  },
  {
    id: "r2",
    username: "SnapQueen",
    handle: "@snapqueen",
    description: "POV: you're living your best life ✨💅 #snapchat #reels",
    likes: 87500,
    comments: 2310,
    shares: 5400,
    bgGradient:
      "linear-gradient(160deg, #f7971e 0%, #ffd200 50%, #1a1a2e 100%)",
    emoji: "✨",
    videoEmoji: "💅",
    sound: "trending audio - snapqueen",
    duration: 12,
  },
  {
    id: "r3",
    username: "TechBro99",
    handle: "@techbro99",
    description: "When the code finally works 🤓💻 #coding #developer",
    likes: 201000,
    comments: 7800,
    shares: 14200,
    bgGradient:
      "linear-gradient(160deg, #0f2027 0%, #203a43 40%, #2c5364 100%)",
    emoji: "💻",
    videoEmoji: "🤓",
    sound: "nerd beat - techbro99",
    duration: 10,
  },
  {
    id: "r4",
    username: "DanceMaster",
    handle: "@dancemaster",
    description: "New trend just dropped 💃🕺 follow for more #dance #trend",
    likes: 534200,
    comments: 18900,
    shares: 67800,
    bgGradient:
      "linear-gradient(160deg, #4776e6 0%, #8e54e9 60%, #1a1a2e 100%)",
    emoji: "💃",
    videoEmoji: "🕺",
    sound: "trending dance mix",
    duration: 18,
  },
  {
    id: "r5",
    username: "FoodieKing",
    handle: "@foodieking",
    description: "This recipe changed my life 🍕🤤 #food #recipe #cooking",
    likes: 98700,
    comments: 3200,
    shares: 8900,
    bgGradient:
      "linear-gradient(160deg, #f953c6 0%, #b91d73 60%, #1a1a2e 100%)",
    emoji: "🍕",
    videoEmoji: "🤤",
    sound: "cooking vibes - foodieking",
    duration: 22,
  },
  {
    id: "r6",
    username: "GamingGod",
    handle: "@gaminggod",
    description: "1v5 clutch, no scope 🎮🏆 #gaming #brawlstars #clutch",
    likes: 312000,
    comments: 11400,
    shares: 28600,
    bgGradient:
      "linear-gradient(160deg, #11998e 0%, #38ef7d 60%, #1a1a2e 100%)",
    emoji: "🎮",
    videoEmoji: "🏆",
    sound: "victory fanfare - gaminggod",
    duration: 9,
  },
  {
    id: "r7",
    username: "NatureWalks",
    handle: "@naturewalks",
    description: "Sunrise hits different at 5am 🌅🌿 #nature #morning #peace",
    likes: 67800,
    comments: 1850,
    shares: 4200,
    bgGradient:
      "linear-gradient(160deg, #f7971e 0%, #fda085 40%, #4facfe 100%)",
    emoji: "🌅",
    videoEmoji: "🌿",
    sound: "morning birds - naturewalks",
    duration: 30,
  },
  {
    id: "r8",
    username: "PrankKing",
    handle: "@prankking",
    description: "He did NOT see that coming 😂💀 #prank #funny #viral",
    likes: 891000,
    comments: 32400,
    shares: 156000,
    bgGradient:
      "linear-gradient(160deg, #e96c35 0%, #e13f59 50%, #1a1a2e 100%)",
    emoji: "😂",
    videoEmoji: "💀",
    sound: "meme soundbyte - prankking",
    duration: 7,
  },
];

// ─── Format numbers ───────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  duration,
  playing,
}: { duration: number; playing: boolean }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset all state/refs when duration changes
  useEffect(() => {
    setProgress(0);
    progressRef.current = 0;
    startRef.current = 0;
    pausedAtRef.current = 0;
  }, [duration]);

  useEffect(() => {
    if (!playing) {
      pausedAtRef.current = progressRef.current;
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const totalMs = duration * 1000;
    const startPct = pausedAtRef.current;
    startRef.current = 0;

    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min(startPct + (elapsed / totalMs) * (1 - startPct), 1);
      progressRef.current = pct;
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, duration]);

  return (
    <div className="w-full h-0.5 bg-white/20 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-yellow-400 rounded-full"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────

interface ActionBtnProps {
  icon: string;
  count: number | string;
  onClick?: () => void;
  active?: boolean;
  "data-ocid"?: string;
}

function ActionBtn({
  icon,
  count,
  onClick,
  active,
  "data-ocid": ocid,
}: ActionBtnProps) {
  const [bounced, setBounced] = useState(false);

  const handleClick = () => {
    setBounced(true);
    setTimeout(() => setBounced(false), 400);
    onClick?.();
  };

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={handleClick}
      className="flex flex-col items-center gap-1 cursor-pointer select-none"
      aria-label={`${icon} ${count}`}
    >
      <motion.div
        animate={bounced ? { scale: [1, 1.4, 0.9, 1.1, 1] } : {}}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm transition-colors ${
          active ? "bg-yellow-400/30" : "bg-white/10 hover:bg-white/20"
        }`}
      >
        {icon}
      </motion.div>
      <span className="text-white text-xs font-bold drop-shadow">
        {typeof count === "number" ? formatCount(count) : count}
      </span>
    </button>
  );
}

// ─── Single Reel Card ─────────────────────────────────────────────────────────

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

function ReelCard({ reel, isActive }: ReelCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(reel.likes);
  const [playing, setPlaying] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    setPlaying(isActive);
  }, [isActive]);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      // double tap
      if (!liked) {
        setLiked(true);
        setLikes((l) => l + 1);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
    lastTap.current = now;
  };

  const handleTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      setPlaying((p) => !p);
    }, 200);
  };

  const toggleLike = () => {
    setLiked((l) => {
      setLikes((c) => (l ? c - 1 : c + 1));
      return !l;
    });
  };

  return (
    <section
      className="relative w-full h-full overflow-hidden rounded-none select-none"
      style={{ background: reel.bgGradient }}
      onClick={() => {
        handleDoubleTap();
        handleTap();
      }}
      onKeyDown={(e) => e.key === " " && setPlaying((p) => !p)}
      aria-label={`Reel by ${reel.username}`}
      data-ocid="reels.card.panel"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ background: "white", top: "10%", left: "20%" }}
          animate={
            isActive
              ? { scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }
              : {}
          }
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full blur-2xl opacity-20"
          style={{
            background: "rgba(255,255,255,0.5)",
            bottom: "20%",
            right: "10%",
          }}
          animate={
            isActive
              ? { scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 20, 0] }
              : {}
          }
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Centre emoji */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="text-[120px] select-none"
          animate={
            isActive
              ? {
                  scale: [1, 1.05, 0.98, 1.03, 1],
                  rotate: [0, 3, -2, 2, 0],
                }
              : { scale: 0.95 }
          }
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {reel.videoEmoji}
        </motion.div>
      </div>

      {/* Pause indicator */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-4xl ml-1">▶</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double-tap heart */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="text-8xl drop-shadow-2xl">❤️</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom overlay gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
        }}
      />

      {/* Top gradient + progress */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 25%)",
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none">
        <ProgressBar duration={reel.duration} playing={playing && isActive} />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-lg font-bold text-black shadow">
              {reel.emoji}
            </div>
            <span className="text-white font-bold text-sm drop-shadow">
              {reel.username}
            </span>
          </div>
          <span className="text-white/70 text-xs">{reel.duration}s</span>
        </div>
      </div>

      {/* Right action bar */}
      <div className="absolute right-3 bottom-32 flex flex-col gap-4 items-center pointer-events-auto">
        <ActionBtn
          data-ocid="reels.like.button"
          icon={liked ? "❤️" : "🤍"}
          count={likes}
          onClick={toggleLike}
          active={liked}
        />
        <ActionBtn
          data-ocid="reels.comment.button"
          icon="💬"
          count={reel.comments}
        />
        <ActionBtn
          data-ocid="reels.share.button"
          icon="↗️"
          count={reel.shares}
        />
        <ActionBtn data-ocid="reels.save.button" icon="🔖" count="Save" />
      </div>

      {/* Bottom user info */}
      <div className="absolute bottom-6 left-4 right-20 pointer-events-none">
        <p className="text-white font-bold text-sm drop-shadow mb-1">
          {reel.handle}
        </p>
        <p className="text-white/90 text-sm leading-snug drop-shadow line-clamp-2">
          {reel.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <motion.span
            className="text-sm"
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            🎵
          </motion.span>
          <span className="text-white/80 text-xs truncate">{reel.sound}</span>
        </div>
      </div>
    </section>
  );
}

// ─── Main SnapchatReels ───────────────────────────────────────────────────────

export default function SnapchatReels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-80, 0, 80], [0.4, 1, 0.4]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, REELS.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
      if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Wheel navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 500) return;
      lastWheel = now;
      if (e.deltaY > 0) goNext();
      else goPrev();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY === null) return;
    const diff = dragStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setDragStartY(null);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 57px)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 z-10 shrink-0"
        style={{ background: "rgba(255, 252, 0, 0.95)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">👻</span>
          <span className="font-extrabold text-black text-lg tracking-tight">
            Spotlight
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="reels.search.button"
            className="text-black/70 hover:text-black"
            aria-label="Search"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <button
            type="button"
            data-ocid="reels.camera.button"
            className="text-black/70 hover:text-black"
            aria-label="Camera"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Reel Feed */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ background: "#000" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            style={{ y, opacity }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <ReelCard reel={REELS[currentIndex]} isActive={true} />
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows (desktop) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 hidden sm:flex">
          <button
            type="button"
            data-ocid="reels.prev.button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
            aria-label="Previous reel"
          >
            ▲
          </button>
          <button
            type="button"
            data-ocid="reels.next.button"
            onClick={goNext}
            disabled={currentIndex === REELS.length - 1}
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
            aria-label="Next reel"
          >
            ▼
          </button>
        </div>

        {/* Dot indicators */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
          {REELS.map((r, i) => (
            <button
              key={r.id}
              type="button"
              data-ocid={`reels.dot.${i + 1}`}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "h-6 bg-yellow-400"
                  : "h-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to reel ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
