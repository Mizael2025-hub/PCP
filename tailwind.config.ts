import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "apple-red": "#FF3B30"
      },
      borderRadius: {
        "ios-btn": "12px",
        "ios-card": "16px",
        "ios-modal": "20px"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)"
      }
    }
  },
  plugins: []
}

export default config
