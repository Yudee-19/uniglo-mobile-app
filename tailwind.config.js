/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors
        "primary-purple": "#49214c",
        "primary-purple2": "#26062b",
        "primary-purple-dark": "#230c2a",
        "primary-yellow-1": "#bb923a",
        "primary-yellow-2": "#e7d7b4",
        "primary-yellow-3": "#d1b06b",

        // Semantic colors (light mode defaults)
        background: "#ffffff",
        foreground: "#1a1a1a",
        card: "#ffffff",
        "card-foreground": "#1a1a1a",
        popover: "#ffffff",
        "popover-foreground": "#1a1a1a",
        primary: "#bb923a",
        "primary-foreground": "#fafafa",
        secondary: "#f5f5f5",
        "secondary-foreground": "#2e2e2e",
        muted: "#f5f5f5",
        "muted-foreground": "#737373",
        accent: "#f5f5f5",
        "accent-foreground": "#2e2e2e",
        destructive: "#dc2626",
        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#a3a3a3",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
      },
      fontFamily: {
        cormorantGaramond: ["CormorantGaramond"],
        lora: ["Lora"],
        lato: ["Lato"],
      },
    },
  },
  plugins: [],
};