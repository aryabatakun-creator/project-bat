import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        corporate: {
          gold: "#D97706",
          lightGold: "#F59E0B",
          darkBlue: "#0F172A",
        }
      },
    },
  },
  plugins: [],
};
export default config;
