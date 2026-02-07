import tailwindConfig from 'tailwindcss/defaultConfig';
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#DBEAFE",
        },
        success: "#16A34A",
        danger: "#DC2626",
        warning: "#F59E0B",
        info: "#0EA5E9",
        background: "#F8FAFC",
        card: "#FFFFFF",
        border: "#E5E7EB",
        muted: "#64748B",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
}

export default config
