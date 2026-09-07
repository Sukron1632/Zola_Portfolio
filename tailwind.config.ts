import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: {
          void: "#0a0a0c",
          canvas: "#111115",
          card: "#18181f",
          highlight: "#22222b",
          border: "#27272a",
          "border-focus": "#3f3f46",
          muted: "#71717a",
          subtext: "#a1a1aa",
          text: "#ededed",
        },
        brand: {
          emerald: "#10b981",
          "emerald-dim": "#4edea3",
          cyan: "#06b6d4",
          "cyan-dim": "#4cd7f6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
