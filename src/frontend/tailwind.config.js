import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
        gauth: {
          accent: "oklch(var(--gauth-accent) / <alpha-value>)",
          "accent-hover": "oklch(var(--gauth-accent-hover) / <alpha-value>)",
          surface: "oklch(var(--gauth-surface) / <alpha-value>)",
          border: "oklch(var(--gauth-border) / <alpha-value>)",
          ring: "oklch(var(--gauth-ring) / <alpha-value>)",
        },
        "sound-meme":    "oklch(var(--sound-meme) / <alpha-value>)",
        "sound-animal":  "oklch(var(--sound-animal) / <alpha-value>)",
        "sound-effect":  "oklch(var(--sound-effect) / <alpha-value>)",
        "sound-music":   "oklch(var(--sound-music) / <alpha-value>)",
        "sound-ui":      "oklch(var(--sound-ui) / <alpha-value>)",
        "sound-fav":     "oklch(var(--sound-fav) / <alpha-value>)",
        "sound-surface": "oklch(var(--sound-surface))",
        "sound-card":    "oklch(var(--sound-card))",
        ig: {
          bg:      "oklch(var(--ig-bg))",
          surface: "oklch(var(--ig-surface))",
          border:  "oklch(var(--ig-border))",
          text:    "oklch(var(--ig-text))",
          muted:   "oklch(var(--ig-muted) / <alpha-value>)",
          accent:  "oklch(var(--ig-accent) / <alpha-value>)",
          heart:   "oklch(var(--ig-heart) / <alpha-value>)",
        },
        game: {
          accent:   "oklch(var(--game-accent) / <alpha-value>)",
          "accent-hover": "oklch(var(--game-accent-hover) / <alpha-value>)",
          surface:  "oklch(var(--game-surface) / <alpha-value>)",
          border:   "oklch(var(--game-border) / <alpha-value>)",
          ring:     "oklch(var(--game-ring) / <alpha-value>)",
          snake:    "oklch(var(--game-snake) / <alpha-value>)",
          x:        "oklch(var(--game-x-color) / <alpha-value>)",
          o:        "oklch(var(--game-o-color) / <alpha-value>)",
          "card-back": "oklch(var(--game-card-back) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        card: "0 4px 16px oklch(0 0 0 / 0.4)",
        "card-hover": "0 8px 32px oklch(0 0 0 / 0.6)",
        "yt-red": "0 0 20px oklch(0.52 0.22 22 / 0.4)",
        "gauth-glow": "0 0 16px oklch(0.68 0.18 265 / 0.3)",
        "sound-meme":   "0 0 18px oklch(0.75 0.24 45 / 0.6)",
        "sound-animal": "0 0 18px oklch(0.72 0.20 145 / 0.6)",
        "sound-effect": "0 0 18px oklch(0.72 0.26 310 / 0.6)",
        "sound-music":  "0 0 18px oklch(0.75 0.20 265 / 0.6)",
        "sound-ui":     "0 0 18px oklch(0.72 0.20 200 / 0.6)",
        "sound-fav":    "0 0 18px oklch(0.78 0.24 65 / 0.6)",
        "game-glow":   "0 0 20px oklch(0.72 0.22 300 / 0.4)",
        "game-snake-glow": "0 0 16px oklch(0.78 0.22 145 / 0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
