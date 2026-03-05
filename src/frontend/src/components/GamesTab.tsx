import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type GameView = "menu" | "snake" | "tictactoe" | "memory" | "brawlstars";

// ─── Snake Game ───────────────────────────────────────────────────────────────

const CELL = 20;
const COLS = 20;
const ROWS = 18;

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

function SnakeGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 9 }] as Point[],
    food: { x: 5, y: 5 } as Point,
    dir: "RIGHT" as Direction,
    nextDir: "RIGHT" as Direction,
    score: 0,
    running: false,
    gameOver: false,
  });
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number.parseInt(localStorage.getItem("snake_hi") ?? "0", 10);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const randomFood = useCallback((snake: Point[]): Point => {
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    // Background
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.beginPath();
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Food — pulsing circle
    const fx = s.food.x * CELL + CELL / 2;
    const fy = s.food.y * CELL + CELL / 2;
    const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, CELL * 0.55);
    grad.addColorStop(0, "#ff4b77");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(fx, fy, CELL * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6b8a";
    ctx.beginPath();
    ctx.arc(fx, fy, CELL * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    s.snake.forEach((seg, i) => {
      const isHead = i === 0;
      const t = 1 - i / (s.snake.length + 1);
      const r = CELL * (isHead ? 0.42 : 0.36);
      const sx = seg.x * CELL + CELL / 2;
      const sy = seg.y * CELL + CELL / 2;
      const g = ctx.createRadialGradient(
        sx - r * 0.2,
        sy - r * 0.2,
        0,
        sx,
        sy,
        r,
      );
      if (isHead) {
        g.addColorStop(0, "oklch(0.85 0.25 145)");
        g.addColorStop(1, "oklch(0.55 0.22 145)");
      } else {
        g.addColorStop(0, `oklch(${0.72 + t * 0.08} 0.22 145)`);
        g.addColorStop(1, `oklch(${0.45 + t * 0.08} 0.18 145)`);
      }
      ctx.fillStyle = g;
      ctx.shadowColor = "oklch(0.78 0.22 145 / 0.6)";
      ctx.shadowBlur = isHead ? 12 : 6;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, []);

  const tick = useCallback(
    (timestamp: number) => {
      const s = stateRef.current;
      if (!s.running) return;
      const elapsed = timestamp - lastTickRef.current;
      const speed = Math.max(80, 180 - s.score * 4);

      if (elapsed >= speed) {
        lastTickRef.current = timestamp;
        s.dir = s.nextDir;
        const head = s.snake[0];
        const next: Point = { x: head.x, y: head.y };
        if (s.dir === "UP") next.y -= 1;
        if (s.dir === "DOWN") next.y += 1;
        if (s.dir === "LEFT") next.x -= 1;
        if (s.dir === "RIGHT") next.x += 1;

        // Wall collision
        if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
          s.running = false;
          s.gameOver = true;
          setGameOver(true);
          const hi = Math.max(s.score, highScore);
          setHighScore(hi);
          try {
            localStorage.setItem("snake_hi", String(hi));
          } catch {
            /* ignore */
          }
          draw();
          return;
        }

        // Self collision
        if (s.snake.some((seg) => seg.x === next.x && seg.y === next.y)) {
          s.running = false;
          s.gameOver = true;
          setGameOver(true);
          const hi = Math.max(s.score, highScore);
          setHighScore(hi);
          try {
            localStorage.setItem("snake_hi", String(hi));
          } catch {
            /* ignore */
          }
          draw();
          return;
        }

        const ate = next.x === s.food.x && next.y === s.food.y;
        s.snake = [next, ...s.snake];
        if (!ate) s.snake.pop();
        if (ate) {
          s.score += 10;
          setScore(s.score);
          s.food = randomFood(s.snake);
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(tick);
    },
    [draw, randomFood, highScore],
  );

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.snake = [{ x: 10, y: 9 }];
    s.dir = "RIGHT";
    s.nextDir = "RIGHT";
    s.score = 0;
    s.running = true;
    s.gameOver = false;
    s.food = randomFood([{ x: 10, y: 9 }]);
    setScore(0);
    setGameOver(false);
    setStarted(true);
    lastTickRef.current = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [randomFood, tick]);

  // Keyboard controls
  useEffect(() => {
    const map: Record<string, Direction> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      w: "UP",
      s: "DOWN",
      a: "LEFT",
      d: "RIGHT",
    };
    const opp: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    const handler = (e: KeyboardEvent) => {
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      const cur = stateRef.current.dir;
      if (d !== opp[cur]) stateRef.current.nextDir = d;
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Initial draw
  useEffect(() => {
    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  const handleDirButton = (d: Direction) => {
    const opp: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    const cur = stateRef.current.dir;
    if (d !== opp[cur]) stateRef.current.nextDir = d;
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Score row */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Score</div>
          <div className="text-2xl font-bold text-game-snake font-display">
            {score}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Best
          </div>
          <div className="text-2xl font-bold text-foreground font-display">
            {highScore}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-game-border shadow-game-snake-glow">
        <canvas
          ref={canvasRef}
          data-ocid="games.snake.canvas_target"
          width={COLS * CELL}
          height={ROWS * CELL}
          className="block"
          style={{ imageRendering: "pixelated" }}
        />
        {/* Overlay */}
        <AnimatePresence>
          {(!started || gameOver) && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {gameOver && (
                <p className="text-lg font-bold text-foreground mb-1 font-display">
                  Game Over!
                </p>
              )}
              {gameOver && (
                <p className="text-sm text-muted-foreground mb-4">
                  Score: {score}
                </p>
              )}
              {!started && !gameOver && (
                <p className="text-sm text-muted-foreground mb-4 text-center px-4">
                  Use arrow keys or the buttons below to control the snake
                </p>
              )}
              <Button
                data-ocid="games.snake.primary_button"
                onClick={startGame}
                className="bg-game-snake hover:bg-game-snake/90 text-black font-bold px-6"
                style={{
                  backgroundColor: "oklch(0.78 0.22 145)",
                  color: "#000",
                }}
              >
                {gameOver ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" /> Play Again
                  </>
                ) : (
                  "Start Game"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* On-screen D-pad */}
      <div className="grid grid-cols-3 gap-1 w-32">
        <div />
        <button
          type="button"
          aria-label="Move up"
          className="h-10 w-10 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
          onClick={() => handleDirButton("UP")}
        >
          <ArrowUp className="w-4 h-4 text-foreground" />
        </button>
        <div />
        <button
          type="button"
          aria-label="Move left"
          className="h-10 w-10 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
          onClick={() => handleDirButton("LEFT")}
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <button
          type="button"
          aria-label="Move down"
          className="h-10 w-10 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
          onClick={() => handleDirButton("DOWN")}
        >
          <ArrowDown className="w-4 h-4 text-foreground" />
        </button>
        <button
          type="button"
          aria-label="Move right"
          className="h-10 w-10 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
          onClick={() => handleDirButton("RIGHT")}
        >
          <ArrowRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <Button
        data-ocid="games.back.button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground mt-2"
        onClick={onBack}
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Games
      </Button>
    </div>
  );
}

// ─── Tic-Tac-Toe ─────────────────────────────────────────────────────────────

type Cell = "X" | "O" | null;
type TTTMode = "pvp" | "cpu";

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

function cpuMove(board: Cell[]): number {
  const empty = board
    .map((c, i) => (c === null ? i : -1))
    .filter((i) => i !== -1);
  if (empty.length === 0) return -1;

  // Win or block
  for (const mark of ["O", "X"] as Cell[]) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      const vals = [board[a], board[b], board[c]];
      const markCount = vals.filter((v) => v === mark).length;
      const nullCount = vals.filter((v) => v === null).length;
      if (markCount === 2 && nullCount === 1) {
        const idx = line[vals.indexOf(null)];
        if (empty.includes(idx)) return idx;
      }
    }
  }

  // Center or random
  if (empty.includes(4)) return 4;
  return empty[Math.floor(Math.random() * empty.length)];
}

function TicTacToeGame({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [mode, setMode] = useState<TTTMode>("cpu");
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [cpuThinking, setCpuThinking] = useState(false);

  const result = checkWinner(board);
  const isDraw = !result && board.every((c) => c !== null);
  const gameOver = !!result || isDraw;

  // CPU auto-move
  useEffect(() => {
    if (mode !== "cpu" || turn !== "O" || gameOver) return;
    setCpuThinking(true);
    const t = setTimeout(() => {
      const idx = cpuMove(board);
      if (idx === -1) return;
      const next = [...board];
      next[idx] = "O";
      setBoard(next);
      setTurn("X");
      setCpuThinking(false);
      const r = checkWinner(next);
      const d = !r && next.every((c) => c !== null);
      if (r)
        setScores((prev) => ({
          ...prev,
          [r.winner as string]: prev[r.winner as "X" | "O"] + 1,
        }));
      if (d) setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
    }, 450);
    return () => clearTimeout(t);
  }, [board, turn, mode, gameOver]);

  const handleCell = (i: number) => {
    if (board[i] || gameOver || cpuThinking) return;
    const next = [...board];
    next[i] = turn;
    setBoard(next);
    const r = checkWinner(next);
    const d = !r && next.every((c) => c !== null);
    if (r)
      setScores((prev) => ({
        ...prev,
        [r.winner as string]: prev[r.winner as "X" | "O"] + 1,
      }));
    if (d) setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
    if (!r && !d) setTurn(turn === "X" ? "O" : "X");
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setCpuThinking(false);
  };

  const cellColor = (cell: Cell) => {
    if (cell === "X") return "text-orange-400";
    if (cell === "O") return "text-blue-400";
    return "";
  };

  const isWinCell = (i: number) => result?.line.includes(i) ?? false;

  return (
    <div className="flex flex-col items-center gap-5 py-4 max-w-sm mx-auto w-full">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted/40 border border-border">
        {(["cpu", "pvp"] as TTTMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              reset();
              setScores({ X: 0, O: 0, draw: 0 });
            }}
            className={[
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
              mode === m
                ? "bg-game-surface text-game-accent border border-game-border"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
            style={
              mode === m
                ? {
                    backgroundColor: "oklch(0.17 0.025 300 / 0.8)",
                    color: "oklch(0.72 0.22 300)",
                    borderColor: "oklch(0.3 0.03 300)",
                  }
                : {}
            }
          >
            {m === "cpu" ? "vs CPU" : "2 Players"}
          </button>
        ))}
      </div>

      {/* Score board */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">
            X {mode === "cpu" ? "(You)" : ""}
          </div>
          <div className="text-2xl font-bold text-orange-400 font-display">
            {scores.X}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Draw</div>
          <div className="text-2xl font-bold text-muted-foreground font-display">
            {scores.draw}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">
            O {mode === "cpu" ? "(CPU)" : ""}
          </div>
          <div className="text-2xl font-bold text-blue-400 font-display">
            {scores.O}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="h-6 text-sm font-medium text-center">
        {result && (
          <span
            className={
              result.winner === "X" ? "text-orange-400" : "text-blue-400"
            }
          >
            {result.winner === "X" && mode === "cpu"
              ? "You win! 🎉"
              : result.winner === "O" && mode === "cpu"
                ? "CPU wins!"
                : `Player ${result.winner} wins! 🎉`}
          </span>
        )}
        {isDraw && (
          <span className="text-muted-foreground">It&apos;s a draw!</span>
        )}
        {!gameOver && cpuThinking && (
          <span className="text-muted-foreground animate-pulse">
            CPU thinking…
          </span>
        )}
        {!gameOver && !cpuThinking && (
          <span className={turn === "X" ? "text-orange-400" : "text-blue-400"}>
            {mode === "cpu"
              ? turn === "X"
                ? "Your turn"
                : "CPU's turn"
              : `Player ${turn}'s turn`}
          </span>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-muted/20 border border-border">
        {board.map((cell, i) => (
          <motion.button
            // biome-ignore lint/suspicious/noArrayIndexKey: board positions are stable 3x3 grid
            key={i}
            type="button"
            onClick={() => handleCell(i)}
            disabled={!!cell || gameOver || cpuThinking}
            whileHover={
              !cell && !gameOver && !cpuThinking ? { scale: 1.05 } : {}
            }
            whileTap={!cell && !gameOver && !cpuThinking ? { scale: 0.95 } : {}}
            className={[
              "w-20 h-20 rounded-xl text-4xl font-bold font-display transition-all duration-200 flex items-center justify-center",
              "border focus-visible:outline-none focus-visible:ring-2",
              isWinCell(i)
                ? cell === "X"
                  ? "bg-orange-400/20 border-orange-400/50"
                  : "bg-blue-400/20 border-blue-400/50"
                : cell
                  ? "bg-muted/30 border-border"
                  : "bg-muted/10 border-border hover:bg-muted/30 cursor-pointer",
              cellColor(cell),
            ].join(" ")}
            aria-label={
              cell ? `Cell ${i + 1}: ${cell}` : `Cell ${i + 1}: empty`
            }
          >
            <AnimatePresence>
              {cell && (
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {cell}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          data-ocid="games.tictactoe.reset.button"
          variant="outline"
          size="sm"
          onClick={reset}
          className="border-border hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          New Game
        </Button>
        <Button
          data-ocid="games.back.button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>
    </div>
  );
}

// ─── Memory Flip ─────────────────────────────────────────────────────────────

const EMOJI_POOL = ["🦊", "🐸", "🦋", "🌸", "⚡", "🎸", "🍕", "🚀"];

interface MemoryCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function MemoryGame({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shuffle = useCallback(() => {
    const deck = [...EMOJI_POOL, ...EMOJI_POOL]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setSeconds(0);
    setWon(false);
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    shuffle();
  }, [shuffle]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const handleCard = (id: number) => {
    if (won) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched || selected.length >= 2) return;

    if (!running) setRunning(true);

    const newSelected = [...selected, id];
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)),
    );
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSelected.map((sid) =>
        cards.find((c) => c.id === sid),
      ) as MemoryCard[];

      if (a.emoji === b.emoji) {
        // Match
        setTimeout(() => {
          setCards((prev) => {
            const next = prev.map((c) =>
              c.id === a.id || c.id === b.id ? { ...c, matched: true } : c,
            );
            if (next.every((c) => c.matched)) {
              setWon(true);
              setRunning(false);
            }
            return next;
          });
          setSelected([]);
        }, 400);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c,
            ),
          );
          setSelected([]);
        }, 900);
      }
    }
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const matched = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="flex flex-col items-center gap-4 py-4 max-w-sm mx-auto w-full">
      {/* Stats */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Pairs</div>
          <div
            className="text-2xl font-bold font-display"
            style={{ color: "oklch(0.72 0.22 300)" }}
          >
            {matched}/{EMOJI_POOL.length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Moves</div>
          <div className="text-2xl font-bold text-foreground font-display">
            {moves}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Time</div>
          <div className="text-2xl font-bold text-foreground font-display">
            {fmt(seconds)}
          </div>
        </div>
      </div>

      {/* Win banner */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-2 px-4 rounded-xl border"
            style={{
              backgroundColor: "oklch(0.17 0.025 300 / 0.8)",
              borderColor: "oklch(0.3 0.03 300)",
            }}
          >
            <p
              className="text-base font-bold font-display"
              style={{ color: "oklch(0.72 0.22 300)" }}
            >
              🎉 You won in {moves} moves!
            </p>
            <p className="text-xs text-muted-foreground">
              Time: {fmt(seconds)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-muted/10 border border-border">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className="memory-card-container w-16 h-16 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-ring rounded-lg"
            onClick={() => handleCard(card.id)}
            aria-label={
              card.flipped || card.matched
                ? `${card.emoji} card`
                : "Facedown card"
            }
          >
            <div
              className={`memory-card-inner ${card.flipped || card.matched ? "flipped" : ""}`}
            >
              {/* Front face (hidden until flipped) */}
              <div
                className="memory-card-face"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.03 300), oklch(0.25 0.04 300))",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "oklch(0.3 0.03 300 / 0.6)",
                }}
              >
                <span
                  className="text-2xl select-none"
                  style={{ color: "oklch(0.45 0.15 300 / 0.5)" }}
                >
                  ✦
                </span>
              </div>
              {/* Back face (the emoji, shown when flipped) */}
              <div
                className={`memory-card-face memory-card-back-face ${card.matched ? "opacity-60" : ""}`}
                style={{
                  background: card.matched
                    ? "linear-gradient(135deg, oklch(0.2 0.02 300), oklch(0.22 0.03 300))"
                    : "linear-gradient(135deg, oklch(0.22 0.03 300), oklch(0.3 0.05 300))",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: card.matched
                    ? "oklch(0.45 0.15 300 / 0.3)"
                    : "oklch(0.72 0.22 300 / 0.5)",
                  boxShadow: card.matched
                    ? "none"
                    : "0 0 12px oklch(0.72 0.22 300 / 0.2)",
                }}
              >
                <span className="text-2xl select-none">{card.emoji}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          data-ocid="games.memory.reset.button"
          variant="outline"
          size="sm"
          onClick={shuffle}
          className="border-border hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Shuffle
        </Button>
        <Button
          data-ocid="games.back.button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>
    </div>
  );
}

// ─── Brawl Stars Game ─────────────────────────────────────────────────────────

const BS_W = 600;
const BS_H = 400;
const PLAYER_R = 14;
const ENEMY_R = 13;
const BULLET_R = 5;
const PLAYER_SPEED = 2.8;
const ENEMY_SPEED = 1.1;
const BULLET_SPEED = 6;
const ENEMY_SHOOT_INTERVAL = 2000; // ms

interface BSPlayer {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  aimAngle: number;
  shootCooldown: number;
  superCooldown: number;
}

interface BSEnemy {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shootTimer: number;
  id: number;
}

interface BSBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  id: number;
  isBear?: boolean;
}

interface BSObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

const OBSTACLES: BSObstacle[] = [
  { x: 120, y: 100, w: 70, h: 35 },
  { x: 410, y: 90, w: 70, h: 35 },
  { x: 250, y: 175, w: 100, h: 30 },
  { x: 120, y: 270, w: 70, h: 35 },
  { x: 410, y: 265, w: 70, h: 35 },
];

const ARENA_PAD = 18;

function clampPlayer(
  x: number,
  y: number,
  r: number,
): { x: number; y: number } {
  return {
    x: Math.max(ARENA_PAD + r, Math.min(BS_W - ARENA_PAD - r, x)),
    y: Math.max(ARENA_PAD + r, Math.min(BS_H - ARENA_PAD - r, y)),
  };
}

function collidesObstacle(
  nx: number,
  ny: number,
  r: number,
  obs: BSObstacle[],
): boolean {
  for (const o of obs) {
    const nearX = Math.max(o.x, Math.min(o.x + o.w, nx));
    const nearY = Math.max(o.y, Math.min(o.y + o.h, ny));
    const dx = nx - nearX;
    const dy = ny - nearY;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

function spawnEnemies(
  wave: number,
  playerX: number,
  playerY: number,
): BSEnemy[] {
  const count = Math.min(3 + wave - 1, 6);
  const spawns: BSEnemy[] = [];
  const corners = [
    { x: 60, y: 60 },
    { x: BS_W - 60, y: 60 },
    { x: 60, y: BS_H - 60 },
    { x: BS_W - 60, y: BS_H - 60 },
    { x: BS_W / 2, y: 50 },
    { x: BS_W / 2, y: BS_H - 50 },
  ];
  for (let i = 0; i < count; i++) {
    const pos = corners[i % corners.length];
    // keep away from player
    const dist = Math.hypot(pos.x - playerX, pos.y - playerY);
    const sx = dist < 80 ? BS_W / 2 + (i % 2 === 0 ? 1 : -1) * 120 : pos.x;
    const sy = dist < 80 ? BS_H / 2 + (i % 2 === 0 ? 1 : -1) * 80 : pos.y;
    spawns.push({
      x: sx,
      y: sy,
      hp: 2,
      maxHp: 2,
      shootTimer: 800 + i * 400,
      id: Date.now() + i,
    });
  }
  return spawns;
}

let bulletIdCounter = 0;

// ─── Brawl Stars Characters ───────────────────────────────────────────────────

interface BrawlCharacter {
  id: string;
  name: string;
  emoji: string;
  description: string;
  hue: number;
  maxHp: number;
  speedMult: number;
  cooldown: number;
  attackLabel: string;
  hpLabel: string;
  speedLabel: string;
  superLabel: string;
  superCooldownMs: number;
}

const BRAWL_CHARACTERS: BrawlCharacter[] = [
  {
    id: "shelly",
    name: "Shelly",
    emoji: "💥",
    description: "Balanced shotgunner. Great all-rounder.",
    hue: 25,
    maxHp: 3,
    speedMult: 1.0,
    cooldown: 350,
    attackLabel: "Medium",
    hpLabel: "Medium",
    speedLabel: "Medium",
    superLabel: "Spread Shot",
    superCooldownMs: 5000,
  },
  {
    id: "colt",
    name: "Colt",
    emoji: "🔫",
    description: "Fast shooter, but fragile. Great damage.",
    hue: 200,
    maxHp: 2,
    speedMult: 1.2,
    cooldown: 200,
    attackLabel: "High",
    hpLabel: "Low",
    speedLabel: "Fast",
    superLabel: "Bullet Storm",
    superCooldownMs: 4000,
  },
  {
    id: "el_primo",
    name: "El Primo",
    emoji: "🥊",
    description: "Tank wrestler. Slow but very tanky.",
    hue: 130,
    maxHp: 5,
    speedMult: 0.75,
    cooldown: 500,
    attackLabel: "Low",
    hpLabel: "High",
    speedLabel: "Slow",
    superLabel: "Fist Slam",
    superCooldownMs: 6000,
  },
  {
    id: "nita",
    name: "Nita",
    emoji: "🐻",
    description: "Summons a bear spirit. Balanced fighter.",
    hue: 300,
    maxHp: 3,
    speedMult: 0.95,
    cooldown: 380,
    attackLabel: "Medium",
    hpLabel: "Medium",
    speedLabel: "Medium",
    superLabel: "Bear Attack",
    superCooldownMs: 7000,
  },
  {
    id: "bull",
    name: "Bull",
    emoji: "🐂",
    description: "Heavy brawler. High HP, short range.",
    hue: 55,
    maxHp: 4,
    speedMult: 0.85,
    cooldown: 450,
    attackLabel: "Medium",
    hpLabel: "High",
    speedLabel: "Slow",
    superLabel: "Bull Charge",
    superCooldownMs: 5500,
  },
  {
    id: "spike",
    name: "Spike",
    emoji: "🌵",
    description: "Cactus shooter. Spiky area damage.",
    hue: 155,
    maxHp: 3,
    speedMult: 1.05,
    cooldown: 400,
    attackLabel: "High",
    hpLabel: "Medium",
    speedLabel: "Medium",
    superLabel: "Spike Storm",
    superCooldownMs: 6000,
  },
];

// ─── Character Select Screen ──────────────────────────────────────────────────

function CharacterSelectScreen({
  selected,
  onSelect,
  onConfirm,
}: {
  selected: BrawlCharacter | null;
  onSelect: (c: BrawlCharacter) => void;
  onConfirm: () => void;
}) {
  const confirmHue = selected?.hue ?? 55;

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-4 w-full"
      style={{
        background:
          "linear-gradient(160deg, #0a0d14 0%, #0d1117 50%, #0a0e0a 100%)",
      }}
    >
      {/* Header */}
      <div className="text-center">
        <div className="text-3xl mb-1">⚔️</div>
        <h2
          className="text-xl font-bold font-display"
          style={{ color: `oklch(0.82 0.2 ${confirmHue})` }}
        >
          Choose Your Brawler
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pick a fighter to enter the arena
        </p>
      </div>

      {/* Character grid */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {BRAWL_CHARACTERS.map((char, i) => {
          const isSelected = selected?.id === char.id;
          return (
            <motion.button
              key={char.id}
              type="button"
              data-ocid={`brawlstars.character.card.${i + 1}`}
              onClick={() => onSelect(char)}
              className="rounded-xl p-2.5 text-left focus-visible:outline-none focus-visible:ring-2"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: i * 0.07,
              }}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.94 }}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, oklch(0.18 0.04 ${char.hue}), oklch(0.22 0.06 ${char.hue}))`
                  : "linear-gradient(135deg, oklch(0.14 0.01 260), oklch(0.18 0.015 260))",
                border: isSelected
                  ? `2px solid oklch(0.7 0.22 ${char.hue})`
                  : "2px solid oklch(0.25 0.02 260 / 0.8)",
                boxShadow: isSelected
                  ? `0 0 16px oklch(0.7 0.22 ${char.hue} / 0.4), inset 0 0 8px oklch(0.7 0.22 ${char.hue} / 0.08)`
                  : "none",
                originX: 0.5,
                originY: 0.5,
              }}
            >
              {/* Emoji */}
              <div className="text-3xl mb-1.5 leading-none">{char.emoji}</div>

              {/* Name */}
              <div
                className="font-bold text-xs leading-tight mb-0.5"
                style={{
                  color: isSelected
                    ? `oklch(0.85 0.2 ${char.hue})`
                    : "oklch(0.82 0.02 260)",
                }}
              >
                {char.name}
              </div>

              {/* Description */}
              <div
                className="text-xs leading-tight mb-2"
                style={{ color: "oklch(0.5 0.01 260)", fontSize: "0.6rem" }}
              >
                {char.description}
              </div>

              {/* Stat pills */}
              <div className="flex flex-col gap-0.5">
                {[
                  { label: "HP", value: char.hpLabel },
                  { label: "Spd", value: char.speedLabel },
                  { label: "Atk", value: char.attackLabel },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-1"
                    style={{ fontSize: "0.55rem" }}
                  >
                    <span
                      style={{
                        color: "oklch(0.45 0.01 260)",
                        minWidth: "1.6rem",
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      className="px-1 rounded font-semibold leading-none py-0.5"
                      style={{
                        background: isSelected
                          ? `oklch(0.7 0.22 ${char.hue} / 0.2)`
                          : "oklch(0.22 0.01 260 / 0.8)",
                        color: isSelected
                          ? `oklch(0.82 0.18 ${char.hue})`
                          : "oklch(0.6 0.01 260)",
                        fontSize: "0.55rem",
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm button */}
      <motion.button
        type="button"
        data-ocid="brawlstars.confirm.primary_button"
        disabled={!selected}
        onClick={onConfirm}
        className="px-8 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        whileHover={selected ? { scale: 1.04 } : {}}
        whileTap={selected ? { scale: 0.95 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          background: selected
            ? `linear-gradient(135deg, oklch(0.72 0.22 ${confirmHue}), oklch(0.62 0.25 ${confirmHue}))`
            : "oklch(0.3 0.01 260)",
          color: selected ? "#0d1117" : "oklch(0.5 0.01 260)",
          boxShadow: selected
            ? `0 4px 24px oklch(0.72 0.22 ${confirmHue} / 0.5)`
            : "none",
          originX: 0.5,
          originY: 0.5,
        }}
      >
        {selected ? `Start Brawling! ${selected.emoji}` : "Select a Brawler"}
      </motion.button>
    </div>
  );
}

// ─── Brawl Stars Game Component ───────────────────────────────────────────────

function BrawlStarsGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Character selection state
  const [selectedCharacter, setSelectedCharacter] =
    useState<BrawlCharacter | null>(BRAWL_CHARACTERS[0]);
  const [characterPicking, setCharacterPicking] = useState(true);

  // Character stat refs for game loop use
  const charSpeedRef = useRef(PLAYER_SPEED);
  const charCooldownRef = useRef(350);
  const charHueRef = useRef(55);
  const charEmojiRef = useRef("💥");
  const charIdRef = useRef("shelly");
  const charSuperCooldownMsRef = useRef(5000);
  const charSuperLabelRef = useRef("Spread Shot");

  // Game state in refs (stable across RAF)
  const playerRef = useRef<BSPlayer>({
    x: BS_W / 2,
    y: BS_H / 2,
    hp: 3,
    maxHp: 3,
    aimAngle: 0,
    shootCooldown: 0,
    superCooldown: 0,
  });
  const enemiesRef = useRef<BSEnemy[]>([]);
  const bulletsRef = useRef<BSBullet[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const waveRef = useRef(1);
  const scoreRef = useRef(0);
  const runningRef = useRef(false);

  // Mobile continuous movement ref
  const mobileDirRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Fist slam visual flash ref (stores timestamp of last slam)
  const slamFlashRef = useRef<number>(0);

  // Last super cooldown update timestamp (for throttled UI update)
  const lastSuperUiUpdateRef = useRef<number>(0);

  // React UI state
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [hp, setHp] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [waveTransition, setWaveTransition] = useState(false);
  const [superCooldown, setSuperCooldown] = useState(0);
  const [maxSuperCooldown, setMaxSuperCooldown] = useState(5000);

  // ── Fire Super ──
  const fireSuper = useCallback(() => {
    if (!runningRef.current) return;
    const player = playerRef.current;
    if (player.superCooldown > 0) return;

    const charId = charIdRef.current;
    const hue = charHueRef.current;
    const aimAngle = player.aimAngle;

    if (charId === "shelly") {
      // Spread Shot: 5 bullets in a fan
      const angles = [-0.4, -0.2, 0, 0.2, 0.4];
      for (const offset of angles) {
        const a = aimAngle + offset;
        bulletsRef.current.push({
          x: player.x + Math.cos(a) * (PLAYER_R + 2),
          y: player.y + Math.sin(a) * (PLAYER_R + 2),
          vx: Math.cos(a) * BULLET_SPEED,
          vy: Math.sin(a) * BULLET_SPEED,
          isPlayer: true,
          id: ++bulletIdCounter,
        });
      }
    } else if (charId === "colt") {
      // Bullet Storm: 6 bullets with tiny random spread at 1.3x speed
      for (let i = 0; i < 6; i++) {
        const spread = (Math.random() - 0.5) * 0.3;
        const a = aimAngle + spread;
        bulletsRef.current.push({
          x: player.x + Math.cos(a) * (PLAYER_R + 2),
          y: player.y + Math.sin(a) * (PLAYER_R + 2),
          vx: Math.cos(a) * BULLET_SPEED * 1.3,
          vy: Math.sin(a) * BULLET_SPEED * 1.3,
          isPlayer: true,
          id: ++bulletIdCounter,
        });
      }
    } else if (charId === "el_primo") {
      // Fist Slam: instant damage to all enemies within 60px
      slamFlashRef.current = Date.now();
      const toRemove = new Set<number>();
      for (const e of enemiesRef.current) {
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist <= 60) {
          e.hp -= 2;
          if (e.hp <= 0) {
            toRemove.add(e.id);
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }
        }
      }
      enemiesRef.current = enemiesRef.current.filter(
        (e) => !toRemove.has(e.id),
      );
    } else if (charId === "nita") {
      // Bear Attack: big bear projectile
      bulletsRef.current.push({
        x: player.x + Math.cos(aimAngle) * (PLAYER_R + 14),
        y: player.y + Math.sin(aimAngle) * (PLAYER_R + 14),
        vx: Math.cos(aimAngle) * 3,
        vy: Math.sin(aimAngle) * 3,
        isPlayer: true,
        isBear: true,
        id: ++bulletIdCounter,
      });
    } else if (charId === "bull") {
      // Bull Charge: dash 120px in aim direction
      const newX = player.x + Math.cos(aimAngle) * 120;
      const newY = player.y + Math.sin(aimAngle) * 120;
      const clamped = clampPlayer(newX, newY, PLAYER_R);
      player.x = clamped.x;
      player.y = clamped.y;
      // Damage enemies near new position
      const toRemove = new Set<number>();
      for (const e of enemiesRef.current) {
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist <= 30) {
          e.hp -= 2;
          if (e.hp <= 0) {
            toRemove.add(e.id);
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }
        }
      }
      enemiesRef.current = enemiesRef.current.filter(
        (e) => !toRemove.has(e.id),
      );
    } else if (charId === "spike") {
      // Spike Storm: 8 bullets in all directions
      for (let i = 0; i < 8; i++) {
        const a = i * ((2 * Math.PI) / 8);
        bulletsRef.current.push({
          x: player.x + Math.cos(a) * (PLAYER_R + 2),
          y: player.y + Math.sin(a) * (PLAYER_R + 2),
          vx: Math.cos(a) * BULLET_SPEED,
          vy: Math.sin(a) * BULLET_SPEED,
          isPlayer: true,
          id: ++bulletIdCounter,
        });
      }
    }

    // Reset super cooldown
    player.superCooldown = charSuperCooldownMsRef.current;
    setSuperCooldown(charSuperCooldownMsRef.current);
    void hue; // used in draw
  }, []);

  // ── Draw ──
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    const enemies = enemiesRef.current;
    const bullets = bulletsRef.current;

    // Clear
    ctx.clearRect(0, 0, BS_W, BS_H);

    // Dark background fill
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, BS_W, BS_H);

    // Arena border glow
    ctx.strokeStyle = "rgba(100,200,100,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      ARENA_PAD,
      ARENA_PAD,
      BS_W - ARENA_PAD * 2,
      BS_H - ARENA_PAD * 2,
    );

    // Grass grid pattern
    ctx.strokeStyle = "rgba(60,120,60,0.12)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let gx = ARENA_PAD; gx <= BS_W - ARENA_PAD; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, ARENA_PAD);
      ctx.lineTo(gx, BS_H - ARENA_PAD);
      ctx.stroke();
    }
    for (let gy = ARENA_PAD; gy <= BS_H - ARENA_PAD; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(ARENA_PAD, gy);
      ctx.lineTo(BS_W - ARENA_PAD, gy);
      ctx.stroke();
    }

    // Obstacles
    for (const o of OBSTACLES) {
      ctx.fillStyle = "#1e2a1a";
      ctx.strokeStyle = "rgba(80,160,80,0.4)";
      ctx.lineWidth = 2;
      const rx = 6;
      ctx.beginPath();
      ctx.roundRect(o.x, o.y, o.w, o.h, rx);
      ctx.fill();
      ctx.stroke();
      // Highlight top
      ctx.fillStyle = "rgba(100,200,80,0.08)";
      ctx.beginPath();
      ctx.roundRect(o.x + 2, o.y + 2, o.w - 4, 8, rx);
      ctx.fill();
    }

    // Fist Slam flash (draw before bullets/enemies so it's behind them)
    const slamAge = Date.now() - slamFlashRef.current;
    if (slamAge < 300) {
      const alpha = (1 - slamAge / 300) * 0.45;
      ctx.save();
      ctx.beginPath();
      ctx.arc(player.x, player.y, 60, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100,255,100,${alpha})`;
      ctx.shadowColor = "rgba(100,255,100,0.8)";
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.restore();
    }

    // Bullets
    for (const b of bullets) {
      ctx.save();
      if (b.isBear) {
        // Bear projectile: large purple circle
        ctx.shadowColor = "rgba(180,80,255,0.9)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#b050ff";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 12, 0, Math.PI * 2);
        ctx.fill();
        // Bear face detail
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🐻", b.x, b.y);
        ctx.textBaseline = "alphabetic";
      } else {
        ctx.shadowColor = b.isPlayer ? "#f5c542" : "#ff4040";
        ctx.shadowBlur = 10;
        ctx.fillStyle = b.isPlayer ? "#f5c542" : "#ff5555";
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_R, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Enemies
    for (const e of enemies) {
      // Shadow
      ctx.save();
      ctx.shadowColor = "rgba(255,100,30,0.5)";
      ctx.shadowBlur = 14;
      // Body
      const eg = ctx.createRadialGradient(
        e.x - 4,
        e.y - 4,
        0,
        e.x,
        e.y,
        ENEMY_R,
      );
      eg.addColorStop(0, "#ff9966");
      eg.addColorStop(1, "#cc3300");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(e.x, e.y, ENEMY_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // HP bar
      const bw = 28;
      const bh = 5;
      const bx = e.x - bw / 2;
      const by = e.y - ENEMY_R - 12;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 2);
      ctx.fill();
      const hpFrac = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = hpFrac > 0.5 ? "#44dd44" : "#ee5500";
      ctx.beginPath();
      ctx.roundRect(bx, by, bw * hpFrac, bh, 2);
      ctx.fill();
    }

    // Player
    ctx.save();
    const playerHue = charHueRef.current;
    ctx.shadowColor = `oklch(0.6 0.22 ${playerHue} / 0.7)`;
    ctx.shadowBlur = 18;
    const pg = ctx.createRadialGradient(
      player.x - 4,
      player.y - 4,
      0,
      player.x,
      player.y,
      PLAYER_R,
    );
    pg.addColorStop(0, `oklch(0.88 0.18 ${playerHue})`);
    pg.addColorStop(1, `oklch(0.48 0.22 ${playerHue})`);
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw character emoji above player
    ctx.save();
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = `oklch(0.85 0.2 ${charHueRef.current})`;
    ctx.fillText(charEmojiRef.current, player.x, player.y - PLAYER_R - 4);
    ctx.restore();

    // Aim direction line
    const aimLen = PLAYER_R + 8;
    ctx.strokeStyle = `oklch(0.85 0.18 ${charHueRef.current} / 0.85)`;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(
      player.x + Math.cos(player.aimAngle) * (PLAYER_R + 2),
      player.y + Math.sin(player.aimAngle) * (PLAYER_R + 2),
    );
    ctx.lineTo(
      player.x + Math.cos(player.aimAngle) * (PLAYER_R + aimLen),
      player.y + Math.sin(player.aimAngle) * (PLAYER_R + aimLen),
    );
    ctx.stroke();

    // Player HP bar (top of canvas HUD)
    const phbw = 80;
    const phbh = 8;
    const phbx = 30;
    const phby = 10;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.roundRect(phbx, phby, phbw, phbh, 3);
    ctx.fill();
    const phpFrac = Math.max(0, player.hp / player.maxHp);
    ctx.fillStyle =
      phpFrac > 0.4 ? `oklch(0.72 0.22 ${charHueRef.current})` : "#ff4444";
    ctx.beginPath();
    ctx.roundRect(phbx, phby, phbw * phpFrac, phbh, 3);
    ctx.fill();
    // HP text
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = `oklch(0.88 0.15 ${charHueRef.current})`;
    ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, phbx + phbw + 8, phby + 8);

    // Wave / score HUD
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#f5c542";
    ctx.textAlign = "right";
    ctx.fillText(`Wave ${waveRef.current}`, BS_W - 30, 22);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Score: ${scoreRef.current}`, BS_W - 30, 40);
    ctx.textAlign = "left";
  }, []);

  // ── Game loop ──
  const loop = useCallback(
    (timestamp: number) => {
      if (!runningRef.current) return;
      const dt = Math.min(timestamp - lastTimeRef.current, 50);
      lastTimeRef.current = timestamp;

      const player = playerRef.current;
      const enemies = enemiesRef.current;
      const keys = keysRef.current;

      // Player movement — keyboard + mobile dir
      let dx = mobileDirRef.current.dx;
      let dy = mobileDirRef.current.dy;
      if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dy -= 1;
      if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dy += 1;
      if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 1;
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        const nx = player.x + (dx / len) * charSpeedRef.current;
        const ny = player.y + (dy / len) * charSpeedRef.current;
        const clamped = clampPlayer(nx, ny, PLAYER_R);
        if (!collidesObstacle(clamped.x, clamped.y, PLAYER_R, OBSTACLES)) {
          player.x = clamped.x;
          player.y = clamped.y;
        }
        // Update aim from movement if no mouse
        if (!mouseRef.current) {
          player.aimAngle = Math.atan2(dy, dx);
        }
      }

      // Mouse aim
      const canvas = canvasRef.current;
      if (mouseRef.current && canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = BS_W / rect.width;
        const scaleY = BS_H / rect.height;
        const mx = (mouseRef.current.x - rect.left) * scaleX;
        const my = (mouseRef.current.y - rect.top) * scaleY;
        player.aimAngle = Math.atan2(my - player.y, mx - player.x);
      }

      // Shoot cooldown
      if (player.shootCooldown > 0) {
        player.shootCooldown -= dt;
      }

      // Super cooldown
      if (player.superCooldown > 0) {
        player.superCooldown = Math.max(0, player.superCooldown - dt);
        // Throttle super UI update to every 100ms
        if (timestamp - lastSuperUiUpdateRef.current > 100) {
          lastSuperUiUpdateRef.current = timestamp;
          setSuperCooldown(player.superCooldown);
        }
      } else if (player.superCooldown === 0) {
        // Ensure it hits exactly 0 in UI
        if (timestamp - lastSuperUiUpdateRef.current > 100) {
          lastSuperUiUpdateRef.current = timestamp;
          setSuperCooldown(0);
        }
      }

      // Enemy update
      for (const e of enemies) {
        // Chase player
        const edx = player.x - e.x;
        const edy = player.y - e.y;
        const eDist = Math.hypot(edx, edy);
        if (eDist > ENEMY_R + PLAYER_R + 10) {
          const enx = e.x + (edx / eDist) * ENEMY_SPEED;
          const eny = e.y + (edy / eDist) * ENEMY_SPEED;
          const ec = clampPlayer(enx, eny, ENEMY_R);
          if (!collidesObstacle(ec.x, ec.y, ENEMY_R, OBSTACLES)) {
            e.x = ec.x;
            e.y = ec.y;
          }
        }

        // Shoot at player
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = ENEMY_SHOOT_INTERVAL;
          const angle = Math.atan2(player.y - e.y, player.x - e.x);
          bulletsRef.current.push({
            x: e.x + Math.cos(angle) * (ENEMY_R + 2),
            y: e.y + Math.sin(angle) * (ENEMY_R + 2),
            vx: Math.cos(angle) * BULLET_SPEED,
            vy: Math.sin(angle) * BULLET_SPEED,
            isPlayer: false,
            id: ++bulletIdCounter,
          });
        }
      }

      // Move bullets
      for (const b of [...bulletsRef.current]) {
        b.x += b.vx;
        b.y += b.vy;
      }

      // Remove out-of-bounds bullets
      bulletsRef.current = bulletsRef.current.filter(
        (b) => b.x >= 0 && b.x <= BS_W && b.y >= 0 && b.y <= BS_H,
      );

      // Bullet vs enemy collision
      const toRemoveBullets = new Set<number>();
      const toRemoveEnemies = new Set<number>();

      for (const b of bulletsRef.current) {
        if (!b.isPlayer) continue;
        const bulletHitR = b.isBear ? 12 : BULLET_R;
        const bearDmg = b.isBear ? 2 : 1;
        for (const e of enemies) {
          const ddx = b.x - e.x;
          const ddy = b.y - e.y;
          if (ddx * ddx + ddy * ddy < (bulletHitR + ENEMY_R) ** 2) {
            toRemoveBullets.add(b.id);
            e.hp -= bearDmg;
            if (e.hp <= 0) {
              toRemoveEnemies.add(e.id);
              scoreRef.current += 10;
              setScore(scoreRef.current);
            }
          }
        }
      }

      // Bullet vs player collision
      for (const b of bulletsRef.current) {
        if (b.isPlayer) continue;
        const ddx = b.x - player.x;
        const ddy = b.y - player.y;
        if (ddx * ddx + ddy * ddy < (BULLET_R + PLAYER_R) ** 2) {
          toRemoveBullets.add(b.id);
          player.hp -= 1;
          setHp(player.hp);
          if (player.hp <= 0) {
            runningRef.current = false;
            setGameOver(true);
            draw(canvas?.getContext("2d") as CanvasRenderingContext2D);
            return;
          }
        }
      }

      bulletsRef.current = bulletsRef.current.filter(
        (b) => !toRemoveBullets.has(b.id),
      );
      enemiesRef.current = enemiesRef.current.filter(
        (e) => !toRemoveEnemies.has(e.id),
      );

      // Next wave check
      if (enemiesRef.current.length === 0) {
        waveRef.current += 1;
        setWave(waveRef.current);
        setWaveTransition(true);
        runningRef.current = false;
        setTimeout(() => {
          setWaveTransition(false);
          enemiesRef.current = spawnEnemies(
            waveRef.current,
            playerRef.current.x,
            playerRef.current.y,
          );
          bulletsRef.current = [];
          runningRef.current = true;
          lastTimeRef.current = performance.now();
          rafRef.current = requestAnimationFrame(loop);
        }, 1800);
        const ctx = canvas?.getContext("2d");
        if (ctx) draw(ctx);
        return;
      }

      // Draw
      const ctx = canvas?.getContext("2d");
      if (ctx) draw(ctx);

      rafRef.current = requestAnimationFrame(loop);
    },
    [draw],
  );

  const startGame = useCallback(() => {
    const char = selectedCharacter ?? BRAWL_CHARACTERS[0];
    // Apply character stats to refs
    charSpeedRef.current = PLAYER_SPEED * char.speedMult;
    charCooldownRef.current = char.cooldown;
    charHueRef.current = char.hue;
    charEmojiRef.current = char.emoji;
    charIdRef.current = char.id;
    charSuperCooldownMsRef.current = char.superCooldownMs;
    charSuperLabelRef.current = char.superLabel;

    waveRef.current = 1;
    scoreRef.current = 0;
    bulletIdCounter = 0;
    playerRef.current = {
      x: BS_W / 2,
      y: BS_H / 2,
      hp: char.maxHp,
      maxHp: char.maxHp,
      aimAngle: 0,
      shootCooldown: 0,
      superCooldown: 0,
    };
    enemiesRef.current = spawnEnemies(1, BS_W / 2, BS_H / 2);
    bulletsRef.current = [];
    keysRef.current = new Set();
    mobileDirRef.current = { dx: 0, dy: 0 };
    slamFlashRef.current = 0;
    setScore(0);
    setWave(1);
    setHp(char.maxHp);
    setGameOver(false);
    setStarted(true);
    setWaveTransition(false);
    setSuperCooldown(0);
    setMaxSuperCooldown(char.superCooldownMs);
    runningRef.current = true;
    lastTimeRef.current = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, selectedCharacter]);

  // Keyboard events
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " ",
          "q",
          "Q",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
      // Space to shoot
      if (e.key === " " && runningRef.current) {
        const player = playerRef.current;
        if (player.shootCooldown <= 0) {
          player.shootCooldown = charCooldownRef.current;
          bulletsRef.current.push({
            x: player.x + Math.cos(player.aimAngle) * (PLAYER_R + 2),
            y: player.y + Math.sin(player.aimAngle) * (PLAYER_R + 2),
            vx: Math.cos(player.aimAngle) * BULLET_SPEED,
            vy: Math.sin(player.aimAngle) * BULLET_SPEED,
            isPlayer: true,
            id: ++bulletIdCounter,
          });
        }
      }
      // Q to fire super
      if ((e.key === "q" || e.key === "Q") && runningRef.current) {
        fireSuper();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [fireSuper]);

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseRef.current = null;
    };
    const onMouseClick = (e: MouseEvent) => {
      if (!runningRef.current) return;
      e.preventDefault();
      const player = playerRef.current;
      if (player.shootCooldown <= 0) {
        player.shootCooldown = charCooldownRef.current;
        bulletsRef.current.push({
          x: player.x + Math.cos(player.aimAngle) * (PLAYER_R + 2),
          y: player.y + Math.sin(player.aimAngle) * (PLAYER_R + 2),
          vx: Math.cos(player.aimAngle) * BULLET_SPEED,
          vy: Math.sin(player.aimAngle) * BULLET_SPEED,
          isPlayer: true,
          id: ++bulletIdCounter,
        });
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("click", onMouseClick);
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onMouseClick);
    };
  }, []);

  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    draw(ctx);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  // Mobile D-pad handler — sets mobileDirRef for continuous movement in game loop
  const handleMobileDpadDown = (ddx: number, ddy: number) => {
    mobileDirRef.current = { dx: ddx, dy: ddy };
  };

  const handleMobileDpadUp = () => {
    mobileDirRef.current = { dx: 0, dy: 0 };
  };

  const handleMobileFire = () => {
    if (!runningRef.current) return;
    const player = playerRef.current;
    if (player.shootCooldown <= 0) {
      player.shootCooldown = charCooldownRef.current;
      bulletsRef.current.push({
        x: player.x + Math.cos(player.aimAngle) * (PLAYER_R + 2),
        y: player.y + Math.sin(player.aimAngle) * (PLAYER_R + 2),
        vx: Math.cos(player.aimAngle) * BULLET_SPEED,
        vy: Math.sin(player.aimAngle) * BULLET_SPEED,
        isPlayer: true,
        id: ++bulletIdCounter,
      });
    }
  };

  const handleMobileSuper = () => {
    fireSuper();
  };

  const charHue = selectedCharacter?.hue ?? 55;
  const superReady = superCooldown <= 0;
  const superFillPct = superReady
    ? 100
    : Math.round(((maxSuperCooldown - superCooldown) / maxSuperCooldown) * 100);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* Character Select Screen — rendered outside canvas when picking */}
      <AnimatePresence mode="wait">
        {characterPicking ? (
          <motion.div
            key="char-select"
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <CharacterSelectScreen
              selected={selectedCharacter}
              onSelect={setSelectedCharacter}
              onConfirm={() => {
                setCharacterPicking(false);
                setStarted(false);
                setGameOver(false);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="game-area"
            className="flex flex-col items-center gap-3 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* HUD row */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Score
                </div>
                <div
                  className="text-2xl font-bold font-display"
                  style={{ color: "oklch(0.78 0.22 55)" }}
                >
                  {score}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Wave</div>
                <div
                  className="text-2xl font-bold font-display"
                  style={{ color: "oklch(0.78 0.22 55)" }}
                >
                  {wave}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">HP</div>
                <div
                  className="text-2xl font-bold font-display"
                  style={{
                    color: `oklch(0.78 0.22 ${charHue})`,
                  }}
                >
                  {(() => {
                    const maxH = selectedCharacter?.maxHp ?? 3;
                    if (maxH > 5) return `${hp}/${maxH}`;
                    return (
                      "❤️".repeat(Math.max(0, hp)) +
                      "🖤".repeat(Math.max(0, maxH - hp))
                    );
                  })()}
                </div>
              </div>
              {/* Super cooldown pill in HUD */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Super
                </div>
                <div
                  className="relative text-xs font-bold rounded-full px-3 py-1 overflow-hidden"
                  style={{
                    background: "oklch(0.15 0.02 260)",
                    border: `1px solid oklch(0.4 0.12 ${charHue} / 0.5)`,
                    color: superReady
                      ? `oklch(0.85 0.22 ${charHue})`
                      : "oklch(0.55 0.08 260)",
                  }}
                >
                  {/* Fill bar behind text */}
                  <div
                    className="absolute inset-0 transition-all duration-100"
                    style={{
                      width: `${superFillPct}%`,
                      background: `oklch(0.45 0.18 ${charHue} / 0.25)`,
                    }}
                  />
                  <span className="relative">
                    {superReady
                      ? "⚡ READY"
                      : `${Math.ceil(superCooldown / 1000)}s`}
                  </span>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div
              className="relative rounded-xl overflow-hidden border-2 shadow-lg"
              style={{ borderColor: `oklch(0.4 0.1 ${charHue} / 0.6)` }}
            >
              <canvas
                ref={canvasRef}
                data-ocid="games.brawlstars.canvas_target"
                width={BS_W}
                height={BS_H}
                className="block max-w-full"
                style={{ cursor: "crosshair", maxHeight: "55vh" }}
              />

              {/* Start overlay (shown after character pick, before game starts) */}
              <AnimatePresence>
                {!started && !gameOver && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                    style={{
                      background: "rgba(13,17,23,0.88)",
                      backdropFilter: "blur(6px)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-5xl mb-1">
                      {selectedCharacter?.emoji ?? "⚔️"}
                    </div>
                    <h2
                      className="text-2xl font-bold font-display"
                      style={{
                        color: `oklch(0.78 0.22 ${charHue})`,
                      }}
                    >
                      {selectedCharacter?.name ?? "Brawl Stars"} — Ready!
                    </h2>
                    <p className="text-sm text-muted-foreground text-center max-w-xs px-4">
                      WASD/Arrows to move · Click or Space to shoot ·{" "}
                      <strong style={{ color: `oklch(0.78 0.22 ${charHue})` }}>
                        Q
                      </strong>{" "}
                      for{" "}
                      <strong style={{ color: `oklch(0.78 0.22 ${charHue})` }}>
                        {selectedCharacter?.superLabel ?? "Super"}
                      </strong>
                      !
                    </p>
                    <Button
                      onClick={startGame}
                      className="font-bold px-8 py-2 text-base mt-2"
                      style={{
                        backgroundColor: `oklch(0.78 0.22 ${charHue})`,
                        color: "#0d1117",
                      }}
                    >
                      Start Brawling!
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wave transition overlay */}
              <AnimatePresence>
                {waveTransition && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    style={{
                      background: "rgba(13,17,23,0.78)",
                      backdropFilter: "blur(4px)",
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      className="text-3xl font-bold font-display"
                      style={{ color: "oklch(0.78 0.22 55)" }}
                    >
                      Wave {wave} Complete!
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get ready for Wave {wave + 1}...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Over overlay */}
              <AnimatePresence>
                {gameOver && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                    style={{
                      background: "rgba(13,17,23,0.88)",
                      backdropFilter: "blur(6px)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-5xl">💀</div>
                    <h2 className="text-2xl font-bold font-display text-red-400">
                      You were knocked out!
                    </h2>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Final Score:{" "}
                        <span
                          className="font-bold text-base"
                          style={{
                            color: `oklch(0.78 0.22 ${charHue})`,
                          }}
                        >
                          {score}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Made it to Wave{" "}
                        <span className="font-bold text-foreground">
                          {wave}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        data-ocid="brawlstars.change_character.secondary_button"
                        variant="outline"
                        onClick={() => {
                          setGameOver(false);
                          setStarted(false);
                          setCharacterPicking(true);
                        }}
                        className="font-semibold px-5 py-2 border"
                        style={{
                          borderColor: `oklch(0.4 0.1 ${charHue} / 0.6)`,
                          color: `oklch(0.78 0.22 ${charHue})`,
                          backgroundColor: "transparent",
                        }}
                      >
                        Change Character
                      </Button>
                      <Button
                        data-ocid="brawlstars.play_again.primary_button"
                        onClick={startGame}
                        className="font-bold px-6 py-2"
                        style={{
                          backgroundColor: `oklch(0.78 0.22 ${charHue})`,
                          color: "#0d1117",
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Play Again
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile controls */}
            <div className="flex items-end gap-6 mt-1">
              {/* D-pad */}
              <div className="grid grid-cols-3 gap-1">
                <div />
                <button
                  type="button"
                  aria-label="Move up"
                  className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors active:scale-95 select-none touch-none"
                  style={{
                    background: `oklch(0.18 0.02 ${charHue} / 0.8)`,
                    border: `1px solid oklch(0.4 0.1 ${charHue} / 0.5)`,
                  }}
                  onPointerDown={() => handleMobileDpadDown(0, -1)}
                  onPointerUp={handleMobileDpadUp}
                  onPointerLeave={handleMobileDpadUp}
                >
                  <ArrowUp
                    className="w-4 h-4"
                    style={{ color: `oklch(0.78 0.22 ${charHue})` }}
                  />
                </button>
                <div />
                <button
                  type="button"
                  aria-label="Move left"
                  className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors active:scale-95 select-none touch-none"
                  style={{
                    background: `oklch(0.18 0.02 ${charHue} / 0.8)`,
                    border: `1px solid oklch(0.4 0.1 ${charHue} / 0.5)`,
                  }}
                  onPointerDown={() => handleMobileDpadDown(-1, 0)}
                  onPointerUp={handleMobileDpadUp}
                  onPointerLeave={handleMobileDpadUp}
                >
                  <ArrowLeft
                    className="w-4 h-4"
                    style={{ color: `oklch(0.78 0.22 ${charHue})` }}
                  />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors active:scale-95 select-none touch-none"
                  style={{
                    background: `oklch(0.18 0.02 ${charHue} / 0.8)`,
                    border: `1px solid oklch(0.4 0.1 ${charHue} / 0.5)`,
                  }}
                  onPointerDown={() => handleMobileDpadDown(0, 1)}
                  onPointerUp={handleMobileDpadUp}
                  onPointerLeave={handleMobileDpadUp}
                >
                  <ArrowDown
                    className="w-4 h-4"
                    style={{ color: `oklch(0.78 0.22 ${charHue})` }}
                  />
                </button>
                <button
                  type="button"
                  aria-label="Move right"
                  className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors active:scale-95 select-none touch-none"
                  style={{
                    background: `oklch(0.18 0.02 ${charHue} / 0.8)`,
                    border: `1px solid oklch(0.4 0.1 ${charHue} / 0.5)`,
                  }}
                  onPointerDown={() => handleMobileDpadDown(1, 0)}
                  onPointerUp={handleMobileDpadUp}
                  onPointerLeave={handleMobileDpadUp}
                >
                  <ArrowRight
                    className="w-4 h-4"
                    style={{ color: `oklch(0.78 0.22 ${charHue})` }}
                  />
                </button>
              </div>

              {/* Fire + Super buttons */}
              <div className="flex flex-col items-center gap-2">
                {/* Super button + cooldown bar */}
                <div className="flex flex-col items-center gap-1 w-20">
                  {/* Cooldown bar */}
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.2 0.01 260)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-100"
                      style={{
                        width: `${superFillPct}%`,
                        background: superReady
                          ? `oklch(0.78 0.22 ${charHue})`
                          : `oklch(0.55 0.15 ${charHue})`,
                        boxShadow: superReady
                          ? `0 0 6px oklch(0.78 0.22 ${charHue} / 0.8)`
                          : "none",
                      }}
                    />
                  </div>
                  {/* Super button */}
                  <button
                    type="button"
                    aria-label="Super ability"
                    data-ocid="brawlstars.super.button"
                    disabled={!superReady}
                    onPointerDown={handleMobileSuper}
                    className="w-20 h-10 rounded-xl font-bold text-xs active:scale-95 transition-all duration-150 select-none touch-none disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: superReady
                        ? `linear-gradient(135deg, oklch(0.72 0.22 ${charHue}), oklch(0.58 0.26 ${charHue}))`
                        : "oklch(0.22 0.01 260)",
                      color: superReady ? "#0d1117" : "oklch(0.45 0.05 260)",
                      boxShadow: superReady
                        ? `0 0 16px oklch(0.72 0.22 ${charHue} / 0.6)`
                        : "none",
                      border: `1px solid oklch(0.4 0.12 ${charHue} / 0.4)`,
                    }}
                  >
                    ⚡ {selectedCharacter?.superLabel ?? "Super"}
                  </button>
                </div>

                {/* Fire button */}
                <button
                  type="button"
                  aria-label="Fire"
                  className="w-16 h-16 rounded-full font-bold text-xl active:scale-95 transition-transform select-none touch-none"
                  style={{
                    background: `oklch(0.78 0.22 ${charHue})`,
                    color: "#0d1117",
                    boxShadow: `0 0 20px oklch(0.78 0.22 ${charHue} / 0.5)`,
                  }}
                  onPointerDown={handleMobileFire}
                >
                  🔥
                </button>
              </div>
            </div>

            <Button
              data-ocid="games.brawlstars.back.button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground mt-1"
              onClick={onBack}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Games
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button always visible during character pick */}
      {characterPicking && (
        <Button
          data-ocid="games.brawlstars.back.button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground mt-1"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Games
        </Button>
      )}
    </div>
  );
}

// ─── Game Menu ────────────────────────────────────────────────────────────────

const GAMES = [
  {
    id: "snake" as const,
    emoji: "🐍",
    name: "Snake",
    description: "Classic snake — eat food, grow longer, don't hit the walls!",
    color: "145",
    ocid: "games.snake",
  },
  {
    id: "tictactoe" as const,
    emoji: "✕○",
    name: "Tic-Tac-Toe",
    description: "Take on the CPU or play with a friend — 3 in a row wins!",
    color: "265",
    ocid: "games.tictactoe",
  },
  {
    id: "memory" as const,
    emoji: "🃏",
    name: "Memory Flip",
    description: "Flip cards to find matching pairs — test your memory!",
    color: "300",
    ocid: "games.memory",
  },
  {
    id: "brawlstars" as const,
    emoji: "⚔️",
    name: "Brawl Stars",
    description: "Arena brawler — defeat enemies in waves, don't get hit!",
    color: "55",
    ocid: "games.brawlstars",
  },
];

function GameMenu({
  onSelect,
}: {
  onSelect: (g: "snake" | "tictactoe" | "memory" | "brawlstars") => void;
}) {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-display text-foreground mb-2">
          🎮 Games
        </h1>
        <p className="text-muted-foreground text-sm">
          Pick a game and start playing right in your browser
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GAMES.map((game, i) => (
          <motion.button
            type="button"
            key={game.id}
            data-ocid={`${game.ocid}.card`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.96 }}
            style={{
              backgroundColor: "oklch(0.16 0.005 260)",
              originX: 0.5,
              originY: 0.5,
            }}
            className="relative rounded-2xl border border-border overflow-hidden cursor-pointer group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-ring"
            onClick={() => onSelect(game.id)}
          >
            {/* Glow hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, oklch(0.72 0.22 ${game.color} / 0.12), transparent 70%)`,
              }}
            />
            <div className="relative p-6 flex flex-col items-center text-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold transition-transform duration-200 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, oklch(0.2 0.03 ${game.color}), oklch(0.28 0.05 ${game.color}))`,
                  border: `1px solid oklch(0.4 0.08 ${game.color} / 0.5)`,
                  boxShadow: `0 4px 16px oklch(0.72 0.22 ${game.color} / 0.15)`,
                }}
              >
                {game.emoji}
              </div>
              <div>
                <h2
                  className="font-bold text-lg font-display mb-1"
                  style={{ color: `oklch(0.72 0.22 ${game.color})` }}
                >
                  {game.name}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {game.description}
                </p>
              </div>
              <Button
                data-ocid={`${game.ocid}.tab`}
                size="sm"
                className="w-full mt-1 font-semibold transition-all duration-200"
                style={{
                  backgroundColor: `oklch(0.72 0.22 ${game.color} / 0.15)`,
                  color: `oklch(0.72 0.22 ${game.color})`,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: `oklch(0.72 0.22 ${game.color} / 0.3)`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(game.id);
                }}
              >
                Play
              </Button>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── GamesTab (Root) ──────────────────────────────────────────────────────────

export default function GamesTab() {
  const [view, setView] = useState<GameView>("menu");

  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence mode="wait">
        {view === "menu" ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <GameMenu onSelect={setView} />
          </motion.div>
        ) : view === "snake" ? (
          <motion.div
            key="snake"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22 }}
          >
            <SnakeGame onBack={() => setView("menu")} />
          </motion.div>
        ) : view === "tictactoe" ? (
          <motion.div
            key="ttt"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22 }}
          >
            <TicTacToeGame onBack={() => setView("menu")} />
          </motion.div>
        ) : view === "memory" ? (
          <motion.div
            key="memory"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22 }}
          >
            <MemoryGame onBack={() => setView("menu")} />
          </motion.div>
        ) : (
          <motion.div
            key="brawlstars"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22 }}
          >
            <BrawlStarsGame onBack={() => setView("menu")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
