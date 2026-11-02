/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        phosphor: {
          p1: "#33FF33",       // Classic IBM P1 Green
          p1glow: "#4AFF00",   // Warm luminescent glow
          p31: "#7FFF00",      // Vibrant radar/scope
          p39: "#006400",      // Deep persistence
          p3: "#FFB700",       // Warm Amber
          p3amber: "#FFD700",  // Radiant gold
          p12: "#FFA500",      // Safety Orange
          cyan: "#00E5FF",     // 3279 Cyan
          white: "#E6FFF2",    // Pale phosphor white
        },
        grayscale: {
          1: "#fdfdfc",
          2: "#f9f9f8",
          3: "#f1f0ef",
          4: "#e4e2e0",
          5: "#d1cfcb",
          6: "#b0ada7",
          7: "#8f8b83",
          8: "#6d6961",
          9: "#54514a",
          10: "#3d3a34",
          11: "#24221d",
          12: "#141311",
        },
        green: {
          9: "#33FF33",
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', '"VT323"', '"Courier New"', 'monospace'],
        display: ['"VT323"', 'monospace'],
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'crt-pulse': 'crtPulse 4s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '0.99' },
          '50%': { opacity: '0.96' },
        },
        crtPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px var(--glow-color))' },
          '50%': { filter: 'drop-shadow(0 0 12px var(--glow-color))' },
        }
      }
    },
  },
  plugins: [],
};
