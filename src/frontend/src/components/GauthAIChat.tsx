import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Brain, RotateCcw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "../hooks/useQueries";
import {
  useChatHistory,
  useClearChatHistory,
  useSendMessage,
} from "../hooks/useQueries";

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      data-ocid="chat.loading_state"
      className="flex items-end gap-3 mb-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gauth-surface flex items-center justify-center flex-shrink-0 border border-gauth-border shadow-gauth-glow">
        <Sparkles className="w-4 h-4 text-gauth-accent" />
      </div>

      {/* Dots */}
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  index: number;
}

function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      data-ocid={`chat.item.${index}`}
      className={[
        "flex items-end gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row",
      ].join(" ")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Avatar — only for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gauth-surface flex items-center justify-center flex-shrink-0 border border-gauth-border shadow-gauth-glow">
          <Sparkles className="w-4 h-4 text-gauth-accent" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={[
          "max-w-[75%] px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm shadow-md"
            : "bg-card border border-border text-card-foreground rounded-2xl rounded-bl-sm",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {/* User indicator placeholder for alignment */}
      {isUser && <div className="w-8 flex-shrink-0" />}
    </motion.div>
  );
}

// ─── Welcome Message ──────────────────────────────────────────────────────────

function WelcomeMessage() {
  return (
    <motion.div
      className="flex items-end gap-3 mb-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-8 h-8 rounded-full bg-gauth-surface flex items-center justify-center flex-shrink-0 border border-gauth-border shadow-gauth-glow">
        <Sparkles className="w-4 h-4 text-gauth-accent" />
      </div>
      <div className="max-w-[75%] bg-card border border-border text-card-foreground rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
        <p>Hi! I'm Gauth AI. How can I help you today?</p>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      data-ocid="chat.empty_state"
      className="flex flex-col items-center justify-center h-full text-center py-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-gauth-surface border border-gauth-border flex items-center justify-center mb-4 shadow-gauth-glow">
        <Brain className="w-8 h-8 text-gauth-accent" />
      </div>
      <h2 className="text-lg font-semibold text-foreground font-display mb-2">
        Gauth AI
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Your intelligent assistant. Ask me anything — I'm here to help.
      </p>
    </motion.div>
  );
}

// ─── Main Chat Component ───────────────────────────────────────────────────────

export default function GauthAIChat() {
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useChatHistory();
  const sendMutation = useSendMessage();
  const clearMutation = useClearChatHistory();

  const isTyping = sendMutation.isPending;
  const canSend = inputValue.trim().length > 0 && !isTyping;

  // Scroll to bottom whenever messages change or typing state changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally trigger on data change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;
    setInputValue("");
    await sendMutation.mutateAsync(text);
  }, [inputValue, isTyping, sendMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleClear = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  // Auto-resize textarea
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    },
    [],
  );

  const showWelcome = !isLoading && messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* ─── Chat Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gauth-surface border border-gauth-border flex items-center justify-center shadow-gauth-glow">
            <Sparkles className="w-4 h-4 text-gauth-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground font-display leading-none">
              Gauth AI
            </h2>
            <p className="text-[10px] text-gauth-accent mt-0.5 font-medium">
              {isTyping ? "Thinking..." : "Online"}
            </p>
          </div>
        </div>

        <Button
          data-ocid="chat.clear_button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={clearMutation.isPending || messages.length === 0}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
          aria-label="Clear chat history"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear chat</span>
        </Button>
      </div>

      {/* ─── Messages Area ────────────────────────────────────────── */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="px-4 py-4 max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex items-end gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
                >
                  {i % 2 !== 0 && (
                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 animate-pulse" />
                  )}
                  <div
                    className={`h-10 rounded-2xl bg-muted animate-pulse ${i % 2 === 0 ? "w-48" : "w-64"}`}
                  />
                </div>
              ))}
            </div>
          ) : showWelcome ? (
            <>
              <WelcomeMessage />
              <EmptyState />
            </>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <MessageBubble key={msg.id} message={msg} index={idx + 1} />
              ))}
            </AnimatePresence>
          )}

          {/* Typing indicator */}
          <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ─── Input Bar ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border px-4 py-3 bg-background/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              data-ocid="chat.input"
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message Gauth AI..."
              rows={1}
              className="resize-none overflow-hidden min-h-[42px] max-h-[120px] py-2.5 pr-3 text-sm bg-input border-border focus-visible:ring-gauth-ring rounded-xl placeholder:text-muted-foreground leading-relaxed"
              aria-label="Message input"
              disabled={isTyping}
            />
          </div>

          <Button
            data-ocid="chat.send_button"
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className="w-9 h-9 rounded-xl flex-shrink-0 bg-gauth-accent hover:bg-gauth-accent-hover text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-gauth-glow transition-all duration-200"
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
