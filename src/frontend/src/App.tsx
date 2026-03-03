import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Search, Sparkles, X, Youtube } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import GauthAIChat from "./components/GauthAIChat";
import {
  type Video,
  useAllFeaturedVideos,
  useSearchVideos,
} from "./hooks/useQueries";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Music", "Gaming", "Education", "Comedy", "Sports"];

type AppTab = "youtube" | "gauth";

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
      data-ocid={`video.item.${index}`}
      className="group rounded-lg overflow-hidden bg-card border border-border cursor-pointer card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={() => onClick(video)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(video)}
      tabIndex={0}
      aria-label={`Play ${video.title} by ${video.channelName}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
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
            data-ocid="player.dialog"
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
                  data-ocid="player.close_button"
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
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          data-ocid="category.tab"
          role="tab"
          aria-selected={activeCategory === cat}
          onClick={() => onChange(cat)}
          className={[
            "relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            activeCategory === cat
              ? "bg-primary text-primary-foreground shadow-yt-red"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          ].join(" ")}
        >
          {cat}
          {activeCategory === cat && (
            <motion.span
              layoutId="active-category-pill"
              className="absolute inset-0 rounded-full bg-primary -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
        </button>
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
              data-ocid="search.input"
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
            data-ocid="search.button"
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
            data-ocid="video.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {(["a", "b", "c", "d", "e", "f", "g", "h"] as const).map((id) => (
              <VideoCardSkeleton key={id} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <motion.div
            data-ocid="video.empty_state"
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

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("youtube");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
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
              <button
                type="button"
                data-ocid="youtube.tab"
                role="tab"
                aria-selected={activeTab === "youtube"}
                onClick={() => setActiveTab("youtube")}
                className={[
                  "relative flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  activeTab === "youtube"
                    ? "text-foreground bg-muted/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                ].join(" ")}
              >
                <Youtube className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">YouTube</span>
                {activeTab === "youtube" && (
                  <motion.span
                    layoutId="active-app-tab"
                    className="absolute inset-0 rounded-lg bg-muted/60 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
              </button>

              <button
                type="button"
                data-ocid="chat.tab"
                role="tab"
                aria-selected={activeTab === "gauth"}
                onClick={() => setActiveTab("gauth")}
                className={[
                  "relative flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gauth-ring",
                  activeTab === "gauth"
                    ? "text-gauth-accent bg-gauth-surface"
                    : "text-muted-foreground hover:text-gauth-accent hover:bg-gauth-surface/60",
                ].join(" ")}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Gauth AI</span>
                {activeTab === "gauth" && (
                  <motion.span
                    layoutId="active-app-tab"
                    className="absolute inset-0 rounded-lg bg-gauth-surface -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* ─── Tab Content ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "youtube" ? (
          <motion.div
            key="youtube"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <YouTubeView onSelectVideo={setSelectedVideo} />
          </motion.div>
        ) : (
          <motion.div
            key="gauth"
            className="flex-1 flex flex-col min-h-0"
            style={{ height: "calc(100vh - 57px)" }}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <GauthAIChat />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Footer (YouTube tab only) ───────────────────────────────── */}
      {activeTab === "youtube" && (
        <footer className="border-t border-border py-5 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {year}. Built with{" "}
              <span className="text-primary" aria-hidden="true">
                ♥
              </span>{" "}
              using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.hostname : "",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-2"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      )}

      {/* ─── Video Player Modal ───────────────────────────────────────── */}
      <PlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}
