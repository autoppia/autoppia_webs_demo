import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Dynamic button classes from structureVariations.json
    "ml-3", "px-4", "py-2", "rounded-full", "text-white", "font-semibold", "text-lg", "flex", "items-center", "shadow-md", "shadow-sm", "border", "border-neutral-200", "hover:bg-[#9ba6ce]", "focus:outline-none", "transition-all",
    "bg-[#616882]",
    "bg-[#4f46e5]", "hover:bg-[#6366f1]",
    "bg-neutral-800", "hover:bg-neutral-700",
    "bg-[#EA580C]", "hover:bg-[#F97316]",
    "bg-[#0EA5E9]", "hover:bg-[#38BDF8]",
    "bg-[#0284C7]", "hover:bg-[#0EA5E9]",
    "bg-[#16A34A]", "hover:bg-[#22C55E]",
    "bg-[#F59E0B]", "hover:bg-[#FBBF24]",
    "bg-black", "hover:bg-neutral-800",
    "bg-[#A78BFA]", "hover:bg-[#C4B5FD]",
    "bg-[#D97706]", "hover:bg-[#B45309]",
    "bg-[#BE123C]", "hover:bg-[#E11D48]",
    "bg-[#334155]", "hover:bg-[#475569]",
    "bg-[#10B981]", "hover:bg-[#34D399]",
    "bg-[#7C3AED]", "hover:bg-[#8B5CF6]",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
