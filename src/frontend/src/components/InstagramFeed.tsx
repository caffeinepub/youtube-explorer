import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  id: number;
  seed: string;
  username: string;
  avatar: string;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
}

interface Story {
  id: number;
  username: string;
  avatar: string;
  seen: boolean;
}

// ─── Sample Data ───────────────────────────────────────────────────────────────

const STORIES: Story[] = [
  { id: 1, username: "travel_vibes", avatar: "travel", seen: false },
  { id: 2, username: "foodie_daily", avatar: "food", seen: false },
  { id: 3, username: "wild_nature", avatar: "nature", seen: true },
  { id: 4, username: "art_studio_k", avatar: "art", seen: false },
  { id: 5, username: "fitlife_pro", avatar: "fitness", seen: false },
  { id: 6, username: "urban_lens", avatar: "urban", seen: true },
  { id: 7, username: "ocean_dreams", avatar: "ocean", seen: false },
  { id: 8, username: "sunrise_hike", avatar: "hike", seen: false },
];

const POSTS: Post[] = [
  {
    id: 1,
    seed: "santorini1",
    username: "travel_vibes",
    avatar: "tv",
    caption:
      "Golden hour in Santorini never gets old. The light hits different when you're at the edge of the caldera. ✨",
    hashtags: [
      "#travel",
      "#santorini",
      "#greece",
      "#goldenhour",
      "#wanderlust",
    ],
    likes: 4821,
    comments: 142,
    timeAgo: "2h",
  },
  {
    id: 2,
    seed: "pasta99",
    username: "foodie_daily",
    avatar: "fd",
    caption:
      "Homemade carbonara — no cream, just egg, pecorino, guanciale, and patience. Worth every minute 🍝",
    hashtags: ["#foodie", "#carbonara", "#pasta", "#italianfood", "#homecook"],
    likes: 3291,
    comments: 87,
    timeAgo: "4h",
  },
  {
    id: 3,
    seed: "forest88",
    username: "wild_nature",
    avatar: "wn",
    caption:
      "Dawn mist rolling through the ancient pines. There's a stillness here that resets everything.",
    hashtags: ["#nature", "#forest", "#mist", "#hiking", "#outdoors"],
    likes: 6104,
    comments: 203,
    timeAgo: "6h",
  },
  {
    id: 4,
    seed: "abstract42",
    username: "art_studio_k",
    avatar: "ak",
    caption:
      "New piece finished at 2am — oil on canvas, 60×80cm. Sometimes the work just flows. 🎨",
    hashtags: [
      "#art",
      "#oilpainting",
      "#abstract",
      "#contemporaryart",
      "#artist",
    ],
    likes: 2873,
    comments: 94,
    timeAgo: "8h",
  },
  {
    id: 5,
    seed: "gym77",
    username: "fitlife_pro",
    avatar: "fp",
    caption:
      "6am club. No excuses, no shortcuts. Just consistency and the long game 💪",
    hashtags: ["#fitness", "#gym", "#workout", "#motivation", "#lifestyle"],
    likes: 5437,
    comments: 178,
    timeAgo: "10h",
  },
  {
    id: 6,
    seed: "street55",
    username: "urban_lens",
    avatar: "ul",
    caption:
      "The city never truly sleeps. Shot this at 3am — just me, the streets, and a 35mm lens. 📷",
    hashtags: [
      "#streetphotography",
      "#urban",
      "#nightphotography",
      "#city",
      "#photography",
    ],
    likes: 7812,
    comments: 256,
    timeAgo: "12h",
  },
  {
    id: 7,
    seed: "beach33",
    username: "ocean_dreams",
    avatar: "od",
    caption:
      "Crystal-clear waters, zero WiFi, maximum vibes. This is the reset I needed 🌊",
    hashtags: ["#ocean", "#beach", "#travel", "#paradise", "#summer"],
    likes: 9203,
    comments: 317,
    timeAgo: "1d",
  },
  {
    id: 8,
    seed: "mountain44",
    username: "sunrise_hike",
    avatar: "sh",
    caption:
      "Summited at 5,200m. The world looks impossibly small and breathtakingly beautiful from up here. 🏔️",
    hashtags: ["#hiking", "#mountains", "#summit", "#altitude", "#adventure"],
    likes: 4156,
    comments: 129,
    timeAgo: "1d",
  },
  {
    id: 9,
    seed: "coffee22",
    username: "morning_brew",
    avatar: "mb",
    caption:
      "Perfect latte art on a Sunday morning. The café is quiet, my book is open, and all is well ☕",
    hashtags: ["#coffee", "#latteart", "#cafe", "#morning", "#coffeelover"],
    likes: 2644,
    comments: 71,
    timeAgo: "2d",
  },
  {
    id: 10,
    seed: "sunset77",
    username: "golden_hour_co",
    avatar: "gh",
    caption:
      "Chasing sunsets across three countries this month. This one in Lisbon wins 🌅",
    hashtags: ["#sunset", "#lisbon", "#portugal", "#travel", "#goldenhour"],
    likes: 8341,
    comments: 289,
    timeAgo: "2d",
  },
  {
    id: 11,
    seed: "flowers11",
    username: "bloom.studio",
    avatar: "bs",
    caption:
      "Spring is finally here and the peonies are having their moment. Obsessed with this blush and burgundy arrangement 🌸",
    hashtags: [
      "#flowers",
      "#floral",
      "#peonies",
      "#spring",
      "#botanicalphotography",
    ],
    likes: 3782,
    comments: 104,
    timeAgo: "3d",
  },
  {
    id: 12,
    seed: "city88",
    username: "urban_lens",
    avatar: "ul",
    caption:
      "Geometry and light — Tokyo's architecture is unlike anything else on earth. Exploring Shibuya until my feet give out.",
    hashtags: ["#tokyo", "#japan", "#architecture", "#urban", "#travel"],
    likes: 11250,
    comments: 432,
    timeAgo: "3d",
  },
];

// ─── Helper: format numbers ────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// ─── Stories Row ───────────────────────────────────────────────────────────────

function StoriesRow() {
  return (
    <div className="border-b border-ig-border bg-ig-surface">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {STORIES.map((story, i) => (
            <motion.div
              key={story.id}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: i * 0.06,
              }}
            >
              <div
                className={[
                  "w-14 h-14 rounded-full p-[2px]",
                  story.seen ? "bg-ig-border" : "ig-story-ring",
                ].join(" ")}
              >
                <div className="w-full h-full rounded-full bg-ig-bg p-[2px] overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/${story.avatar}face/56/56`}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
              <span className="text-[10px] text-ig-muted w-14 text-center truncate">
                {story.username}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Post Modal ────────────────────────────────────────────────────────────────

interface PostModalProps {
  post: Post | null;
  liked: boolean;
  onToggleLike: () => void;
  onClose: () => void;
}

function PostModal({ post, liked, onToggleLike, onClose }: PostModalProps) {
  if (!post) return null;
  const displayLikes = post.likes + (liked ? 1 : 0);

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="instagram.post.dialog"
        className="max-w-4xl p-0 overflow-hidden border-ig-border bg-ig-surface gap-0"
        aria-label={`Post by ${post.username}`}
      >
        <DialogTitle className="sr-only">Post by {post.username}</DialogTitle>
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Image side */}
          <div className="md:w-3/5 bg-black flex items-center justify-center min-h-64">
            <img
              src={`https://picsum.photos/seed/${post.seed}/800/800`}
              alt={post.caption}
              className="w-full h-full object-cover md:max-h-[90vh]"
            />
          </div>

          {/* Info side */}
          <div className="md:w-2/5 flex flex-col min-h-0">
            {/* Post header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full ig-story-ring p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-ig-bg p-[1.5px] overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${post.avatar}face/32/32`}
                      alt={post.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-ig-text">
                  {post.username}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-ig-muted hover:text-ig-text"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                <Button
                  data-ocid="instagram.post.close_button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-ig-muted hover:text-ig-text"
                  onClick={onClose}
                  aria-label="Close post"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Caption & comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/${post.avatar}face/32/32`}
                    alt={post.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-sm font-semibold text-ig-text">
                    {post.username}
                  </span>{" "}
                  <span className="text-sm text-ig-text">{post.caption}</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-ig-accent font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-ig-muted mt-1">
                    {post.timeAgo} ago
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-ig-border flex-shrink-0 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onToggleLike}
                    className="hover:scale-110 transition-transform duration-150 active:scale-90"
                    aria-label={liked ? "Unlike post" : "Like post"}
                  >
                    <Heart
                      className={[
                        "w-6 h-6 transition-colors duration-200",
                        liked ? "text-ig-heart fill-ig-heart" : "text-ig-text",
                      ].join(" ")}
                    />
                  </button>
                  <button
                    type="button"
                    className="hover:opacity-60 transition-opacity"
                  >
                    <MessageCircle className="w-6 h-6 text-ig-text" />
                  </button>
                  <button
                    type="button"
                    className="hover:opacity-60 transition-opacity"
                  >
                    <Send className="w-6 h-6 text-ig-text" />
                  </button>
                </div>
                <button
                  type="button"
                  className="hover:opacity-60 transition-opacity"
                >
                  <Bookmark className="w-6 h-6 text-ig-text" />
                </button>
              </div>
              <p className="text-sm font-semibold text-ig-text">
                {formatCount(displayLikes)} likes
              </p>
              <p className="text-xs text-ig-muted mt-0.5">
                {formatCount(post.comments)} comments
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Post Thumbnail ────────────────────────────────────────────────────────────

interface PostThumbnailProps {
  post: Post;
  index: number;
  liked: boolean;
  onOpen: () => void;
  onLike: () => void;
}

function PostThumbnail({
  post,
  index,
  liked,
  onOpen,
  onLike,
}: PostThumbnailProps) {
  const displayLikes = post.likes + (liked ? 1 : 0);

  return (
    <motion.div
      data-ocid={`instagram.post.item.${index}`}
      className="relative aspect-square overflow-hidden group rounded-sm"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.3 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ig-accent"
        aria-label={`Post by ${post.username}: ${post.caption.slice(0, 60)}`}
      >
        <img
          src={`https://picsum.photos/seed/${post.seed}/400/400`}
          alt={post.caption.slice(0, 80)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </button>
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-200 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100">
        <div className="flex items-center gap-4 text-white font-semibold text-sm">
          <button
            type="button"
            data-ocid={`instagram.like.button.${index}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            aria-label={liked ? "Unlike post" : "Like post"}
            className="flex items-center gap-1.5 hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${liked ? "fill-ig-heart text-ig-heart" : "fill-white"}`}
            />
            {formatCount(displayLikes)}
          </button>
          <button
            type="button"
            onClick={onOpen}
            className="flex items-center gap-1.5 hover:scale-110 transition-transform"
            aria-label="View comments"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-white" />
            {formatCount(post.comments)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function InstagramFeed() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [openPost, setOpenPost] = useState<Post | null>(null);

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-ig-bg">
      {/* Instagram-style header */}
      <div className="sticky top-0 z-30 bg-ig-bg/95 backdrop-blur-md border-b border-ig-border">
        <motion.div
          className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo wordmark */}
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="ig-icon-grad"
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="oklch(0.72 0.19 45)" />
                  <stop offset="50%" stopColor="oklch(0.62 0.25 10)" />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 295)" />
                </linearGradient>
              </defs>
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                ry="5"
                stroke="url(#ig-icon-grad)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="12"
                cy="12"
                r="4.5"
                stroke="url(#ig-icon-grad)"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-icon-grad)" />
            </svg>
            <span className="ig-wordmark text-xl font-bold text-ig-text select-none">
              Instagram
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-ig-text hover:text-ig-accent transition-colors rounded-full hover:bg-ig-surface"
              aria-label="Notifications"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-ig-text hover:text-ig-accent transition-colors rounded-full hover:bg-ig-surface"
              aria-label="Messages"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stories */}
      <StoriesRow />

      {/* Posts grid */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-5">
        <div className="grid grid-cols-3 gap-[3px] sm:gap-1">
          {POSTS.map((post, i) => (
            <PostThumbnail
              key={post.id}
              post={post}
              index={i + 1}
              liked={likedPosts.has(post.id)}
              onOpen={() => setOpenPost(post)}
              onLike={() => toggleLike(post.id)}
            />
          ))}
        </div>
      </main>

      {/* Post detail modal */}
      <AnimatePresence>
        {openPost && (
          <PostModal
            post={openPost}
            liked={likedPosts.has(openPost.id)}
            onToggleLike={() => toggleLike(openPost.id)}
            onClose={() => setOpenPost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
