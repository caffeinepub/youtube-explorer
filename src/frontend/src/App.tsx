import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gamepad2,
  Instagram,
  Lock,
  Play,
  Search,
  Sparkles,
  Volume2,
  X,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import GamesTab from "./components/GamesTab";
import GauthAIChat from "./components/GauthAIChat";
import InstagramFeed from "./components/InstagramFeed";
import SoundButtonsWorld from "./components/SoundButtonsWorld";
import {
  type Video,
  useAllFeaturedVideos,
  useSearchVideos,
} from "./hooks/useQueries";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Music", "Gaming", "Education", "Comedy", "Sports"];

type AppTab = "youtube" | "gauth" | "sounds" | "instagram" | "games";

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function VideoCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card border border-border">
      <Skeleton className="w-full aspect-video" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 mt-1" />
      </div>
    </div>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

interface VideoCardProps {
  video: Video;
  index: number;
  onClick: (video: Video) => void;
}

function VideoCard({ video, index, onClick }: VideoCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      data-ocid={`youtube.video.item.${index}`}
      className="group rounded-lg overflow-hidden bg-card border border-border cursor-pointer card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={() => onClick(video)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(video)}
      tabIndex={0}
      aria-label={`Play ${video.title} by ${video.channelName}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.05, 0.4),
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video bg-muted">
        {!imgError ? (
          <img
            src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover thumbnail-zoom"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Youtube className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-75 group-hover:scale-100 transform yt-red-glow">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 leading-snug mb-1.5 font-display">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          {video.channelName}
        </p>
        <Badge
          variant="secondary"
          className="text-[10px] px-2 py-0.5 bg-secondary/80 text-secondary-foreground border-0"
        >
          {video.category}
        </Badge>
      </div>
    </motion.div>
  );
}

// ─── Player Modal ─────────────────────────────────────────────────────────────

interface PlayerModalProps {
  video: Video | null;
  onClose: () => void;
}

function PlayerModal({ video, onClose }: PlayerModalProps) {
  return (
    <AnimatePresence>
      {video && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/88"
            style={{ backgroundColor: "var(--modal-overlay)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            data-ocid="youtube.player.panel"
            aria-label={`Playing: ${video.title}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pointer-events-auto w-full max-w-4xl bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
                  <Youtube className="w-5 h-5 text-primary flex-shrink-0" />
                  <h2 className="text-sm font-semibold text-foreground line-clamp-1 font-display">
                    {video.title}
                  </h2>
                </div>
                <Button
                  data-ocid="youtube.player.close_button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted rounded-full flex-shrink-0"
                  onClick={onClose}
                  aria-label="Close video player"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Iframe embed */}
              <div
                className="relative w-full"
                style={{ aspectRatio: "16 / 9" }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Modal footer */}
              <div className="px-4 py-3 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground font-display leading-snug">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {video.channelName}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Category Filter Tabs ─────────────────────────────────────────────────────

interface CategoryTabsProps {
  activeCategory: string;
  onChange: (category: string) => void;
}

function CategoryTabs({ activeCategory, onChange }: CategoryTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Video categories"
      className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide no-scrollbar"
    >
      {CATEGORIES.map((cat, index) => (
        <motion.button
          key={cat}
          type="button"
          data-ocid="youtube.category.tab"
          role="tab"
          aria-selected={activeCategory === cat}
          onClick={() => onChange(cat)}
          className={[
            "relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            activeCategory === cat
              ? "bg-primary text-primary-foreground shadow-yt-red"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          ].join(" ")}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        >
          {cat}
          {activeCategory === cat && (
            <motion.span
              layoutId="active-category-pill"
              className="absolute inset-0 rounded-full bg-primary -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
        </motion.button>
      ))}
    </nav>
  );
}

// ─── YouTube View ─────────────────────────────────────────────────────────────

interface YouTubeViewProps {
  onSelectVideo: (video: Video) => void;
}

function YouTubeView({ onSelectVideo }: YouTubeViewProps) {
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const isSearching = activeSearch.trim().length > 0;

  const { data: featuredVideos, isLoading: featuredLoading } =
    useAllFeaturedVideos();
  const { data: searchResults, isLoading: searchLoading } =
    useSearchVideos(activeSearch);

  const handleSearch = useCallback(() => {
    setActiveSearch(searchInput.trim());
    setActiveCategory("All");
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setActiveSearch("");
    setActiveCategory("All");
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setActiveSearch("");
    setSearchInput("");
  }, []);

  const isLoading = isSearching ? searchLoading : featuredLoading;
  const rawVideos = isSearching
    ? (searchResults ?? [])
    : (featuredVideos ?? []);

  const videos =
    !isSearching && activeCategory !== "All"
      ? rawVideos.filter((v) => v.category === activeCategory)
      : rawVideos;

  return (
    <>
      {/* Search bar row */}
      <div className="border-b border-border px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              data-ocid="youtube.search.input"
              type="search"
              placeholder="Search videos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 pr-9 bg-input border-border focus-visible:ring-primary text-sm h-9"
              aria-label="Search videos"
            />
            {searchInput && (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            data-ocid="youtube.search.button"
            onClick={handleSearch}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-9 flex-shrink-0 font-semibold"
            aria-label="Submit search"
          >
            <Search className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Section header */}
        <div className="mb-5">
          {isSearching ? (
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-foreground font-display">
                  Results for{" "}
                  <span className="text-primary">
                    &ldquo;{activeSearch}&rdquo;
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {!isLoading &&
                    `${videos.length} video${videos.length !== 1 ? "s" : ""} found`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground hover:text-foreground text-xs"
                onClick={handleClearSearch}
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-foreground font-display">
                  {activeCategory === "All"
                    ? "Featured Videos"
                    : activeCategory}
                </h1>
              </div>
              <CategoryTabs
                activeCategory={activeCategory}
                onChange={handleCategoryChange}
              />
            </div>
          )}
        </div>

        {/* Video grid */}
        {isLoading ? (
          <div
            data-ocid="youtube.video.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {(["a", "b", "c", "d", "e", "f", "g", "h"] as const).map((id) => (
              <VideoCardSkeleton key={id} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <motion.div
            data-ocid="youtube.video.empty_state"
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mb-4">
              <Youtube className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground font-display mb-2">
              {isSearching ? "No videos found" : "No videos yet"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isSearching
                ? `We couldn't find any videos matching "${activeSearch}". Try a different search term.`
                : "Videos will appear here once they're added."}
            </p>
            {isSearching && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-border hover:bg-muted"
                onClick={handleClearSearch}
              >
                Back to featured
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index + 1}
                onClick={onSelectVideo}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────

const SESSION_KEY = "yt_explorer_unlocked";
const CORRECT_PASSWORD = "1234";

interface PasswordGateProps {
  onUnlock: () => void;
}

function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value === CORRECT_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "1");
        onUnlock();
      } else {
        setError("Incorrect password. Try again.");
        setShake(true);
        setValue("");
        setTimeout(() => setShake(false), 600);
      }
    },
    [value, onUnlock],
  );

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "oklch(0.08 0.005 260)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 30%, oklch(0.52 0.22 22 / 0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 40% 40% at 80% 80%, oklch(0.68 0.18 265 / 0.06) 0%, transparent 60%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.8 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.8 0 0) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-sm mx-4"
        animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      >
        <motion.div
          className="rounded-2xl border p-8"
          style={{
            background: "oklch(0.14 0.006 260)",
            borderColor: "oklch(0.28 0.008 260)",
            boxShadow:
              "0 0 0 1px oklch(0.52 0.22 22 / 0.1), 0 32px 64px oklch(0 0 0 / 0.7), 0 0 80px oklch(0.52 0.22 22 / 0.08)",
          }}
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Lock icon + title */}
          <div className="flex flex-col items-center mb-7">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.52 0.22 22), oklch(0.42 0.22 22))",
                boxShadow: "0 0 28px oklch(0.52 0.22 22 / 0.4)",
              }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                type: "spring",
                stiffness: 280,
                damping: 18,
              }}
            >
              <Lock className="w-7 h-7 text-white" />
            </motion.div>
            <motion.h1
              className="text-xl font-bold text-foreground font-display tracking-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.35 }}
            >
              YouTube Explorer
            </motion.h1>
            <motion.p
              className="text-sm mt-1"
              style={{ color: "oklch(0.55 0.012 260)" }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.35 }}
            >
              Enter your password to continue
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.35 }}
          >
            <div>
              <Input
                data-ocid="password_gate.input"
                type="password"
                placeholder="Password"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
                autoComplete="current-password"
                className="h-11 text-base text-center tracking-widest placeholder:tracking-normal placeholder:text-sm"
                style={{
                  background: "oklch(0.18 0.007 260)",
                  borderColor: error
                    ? "oklch(0.52 0.22 22)"
                    : "oklch(0.3 0.008 260)",
                }}
                aria-label="Enter password"
                aria-describedby={error ? "password-error" : undefined}
              />
            </div>

            <Button
              data-ocid="password_gate.submit_button"
              type="submit"
              className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              style={{
                boxShadow: value
                  ? "0 0 20px oklch(0.52 0.22 22 / 0.35)"
                  : "none",
                transition: "box-shadow 0.3s ease",
              }}
            >
              Enter
            </Button>

            <AnimatePresence>
              {error && (
                <motion.p
                  id="password-error"
                  data-ocid="password_gate.error_state"
                  role="alert"
                  className="text-center text-sm font-medium"
                  style={{ color: "oklch(0.65 0.22 22)" }}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_ORDER: AppTab[] = [
  "youtube",
  "gauth",
  "sounds",
  "instagram",
  "games",
];

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("youtube");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [direction, setDirection] = useState(0);
  const prevTabRef = useRef<AppTab>("youtube");
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );

  const handleTabChange = useCallback((tab: AppTab) => {
    const prevIdx = TAB_ORDER.indexOf(prevTabRef.current);
    const nextIdx = TAB_ORDER.indexOf(tab);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    prevTabRef.current = tab;
    setActiveTab(tab);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!unlocked && <PasswordGate onUnlock={() => setUnlocked(true)} />}
      </AnimatePresence>

      {!unlocked ? null : (
        <div className="min-h-screen bg-background flex flex-col">
          {/* ─── Header ──────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Logo */}
                <a
                  href="/"
                  className="flex items-center gap-2 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                  aria-label="YouTube Explorer home"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-yt-red">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:block text-base font-bold text-foreground font-display tracking-tight">
                    YouTube
                    <span className="text-primary"> Explorer</span>
                  </span>
                </a>

                {/* Tab Navigation */}
                <nav
                  role="tablist"
                  aria-label="App sections"
                  className="flex items-center gap-1 ml-2"
                >
                  {(
                    [
                      {
                        id: "youtube",
                        icon: <Youtube className="w-4 h-4 flex-shrink-0" />,
                        label: "YouTube",
                        ring: "focus-visible:ring-primary",
                        active: "text-foreground bg-muted/60",
                        inactive:
                          "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                        activeBg: "bg-muted/60",
                        ocid: "nav.youtube.tab",
                      },
                      {
                        id: "gauth",
                        icon: <Sparkles className="w-4 h-4 flex-shrink-0" />,
                        label: "Gauth AI",
                        ring: "focus-visible:ring-gauth-ring",
                        active: "text-gauth-accent bg-gauth-surface",
                        inactive:
                          "text-muted-foreground hover:text-gauth-accent hover:bg-gauth-surface/60",
                        activeBg: "bg-gauth-surface",
                        ocid: "nav.gauth.tab",
                      },
                      {
                        id: "sounds",
                        icon: <Volume2 className="w-4 h-4 flex-shrink-0" />,
                        label: "Sounds",
                        ring: "focus-visible:ring-sound-music",
                        active: "text-sound-music bg-sound-music/10",
                        inactive:
                          "text-muted-foreground hover:text-sound-music hover:bg-sound-music/10",
                        activeBg: "bg-sound-music/10",
                        ocid: "nav.sounds.tab",
                      },
                      {
                        id: "instagram",
                        icon: <Instagram className="w-4 h-4 flex-shrink-0" />,
                        label: "Instagram",
                        ring: "focus-visible:ring-ig-accent",
                        active: "ig-tab-active bg-ig-surface",
                        inactive:
                          "text-muted-foreground hover:text-ig-text hover:bg-ig-surface/60",
                        activeBg: "bg-ig-surface",
                        ocid: "nav.instagram.tab",
                      },
                      {
                        id: "games",
                        icon: <Gamepad2 className="w-4 h-4 flex-shrink-0" />,
                        label: "Games",
                        ring: "focus-visible:ring-game-ring",
                        active: "text-game-accent bg-game-surface",
                        inactive:
                          "text-muted-foreground hover:text-game-accent hover:bg-game-surface/60",
                        activeBg: "bg-game-surface",
                        ocid: "nav.games.tab",
                      },
                    ] as const
                  ).map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      type="button"
                      data-ocid={tab.ocid}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => handleTabChange(tab.id as AppTab)}
                      className={[
                        "relative flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
                        tab.ring,
                        activeTab === tab.id ? tab.active : tab.inactive,
                      ].join(" ")}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 + 0.2, duration: 0.3 }}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.span
                          layoutId="active-app-tab"
                          className={`absolute inset-0 rounded-lg -z-10 ${tab.activeBg}`}
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.35,
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </nav>
              </motion.div>
            </div>
          </header>

          {/* ─── Tab Content ─────────────────────────────────────────────── */}
          <AnimatePresence mode="wait" custom={direction}>
            {activeTab === "youtube" ? (
              <motion.div
                key="youtube"
                className="flex-1 flex flex-col"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <YouTubeView onSelectVideo={setSelectedVideo} />
              </motion.div>
            ) : activeTab === "gauth" ? (
              <motion.div
                key="gauth"
                className="flex-1 flex flex-col min-h-0"
                style={{ height: "calc(100vh - 57px)" }}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <GauthAIChat />
              </motion.div>
            ) : activeTab === "sounds" ? (
              <motion.div
                key="sounds"
                className="flex-1 flex flex-col overflow-y-auto"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <SoundButtonsWorld />
              </motion.div>
            ) : activeTab === "instagram" ? (
              <motion.div
                key="instagram"
                className="flex-1 flex flex-col overflow-y-auto"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <InstagramFeed />
              </motion.div>
            ) : (
              <motion.div
                key="games"
                className="flex-1 flex flex-col overflow-y-auto"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <GamesTab />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Video Player Modal ───────────────────────────────────────── */}
          <PlayerModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        </div>
      )}
    </>
  );
}
