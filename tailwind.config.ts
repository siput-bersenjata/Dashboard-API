import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          950: "#070D1E",
          900: "#0B132B",
          850: "#0E1838",
          800: "#132147",
          700: "#1C2E60",
        },
        card: {
          dark: "#0F1A36",
          border: "#1E2C52",
        },
        brand: {
          blue: "#2563EB",
          lightBlue: "#38BDF8",
          green: "#10B981",
          emerald: "#059669",
          red: "#EF4444",
        }
      },
    },
  },
  plugins: [],
};
export default config;
