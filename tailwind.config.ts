import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      opacity: {
        6: "0.06",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        14: "0.14",
        16: "0.16",
        18: "0.18",
        24: "0.24",
        34: "0.34",
        42: "0.42",
        54: "0.54",
        56: "0.56",
        58: "0.58",
        62: "0.62",
        64: "0.64",
        66: "0.66",
        68: "0.68",
        72: "0.72",
        78: "0.78",
        84: "0.84",
        86: "0.86",
      },
      colors: {
        ink: "#070812",
        panel: "#11131f",
        panelSoft: "#181b2a",
        line: "#2b3147",
        pulse: "#36f3ff",
        mint: "#6dff9d",
        solar: "#ffd166",
        bloom: "#ff5fa2",
      },
      boxShadow: {
        glow: "0 0 28px rgba(54, 243, 255, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
