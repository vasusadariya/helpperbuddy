import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // background: "var(--background)",
        foreground: "var(--foreground)",
        text: '#050907',
        background: '#fafcfa',
        primary: '#14532D',
        secondary: '#a0aac7',
        accent: '#86EFAC',
      },
    },
  },
  plugins: [],
} satisfies Config;
