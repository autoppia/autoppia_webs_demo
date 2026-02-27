import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        discord: {
          dark: "var(--dc-dark)",
          darker: "var(--dc-darker)",
          darkest: "var(--dc-darkest)",
          sidebar: "var(--dc-sidebar)",
          channel: "var(--dc-channel)",
          input: "var(--dc-input)",
          accent: "var(--dc-accent)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
