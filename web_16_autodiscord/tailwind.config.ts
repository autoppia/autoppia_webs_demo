import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        discord: {
          dark: "#313338",
          darker: "#2b2d31",
          darkest: "#1e1f22",
          sidebar: "#2b2d31",
          channel: "#313338",
          input: "#383a40",
          accent: "#5865f2",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
