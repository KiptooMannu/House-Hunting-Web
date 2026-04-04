import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "outline-variant": "#c2c6d1",
        "on-surface-variant": "#424750",
        "secondary-container": "#a0f399",
        "primary": "#003461",
        "on-secondary-fixed-variant": "#005312",
        "on-primary-fixed-variant": "#004882",
        "tertiary-fixed-dim": "#ffb692",
        "surface": "#f8fafb",
        "primary-fixed": "#d3e4ff",
        "on-tertiary-fixed-variant": "#7a3000",
        "on-tertiary-container": "#ffa273",
        "on-primary-fixed": "#001c38",
        "surface-bright": "#f8fafb",
        "surface-container": "#eceeef",
        "on-surface": "#191c1d",
        "on-secondary": "#ffffff",
        "inverse-primary": "#a3c9ff",
        "tertiary-container": "#7e3200",
        "primary-fixed-dim": "#a3c9ff",
        "error-container": "#ffdad6",
        "primary-container": "#004b87",
        "on-primary": "#ffffff",
        "inverse-surface": "#2e3132",
        "on-secondary-fixed": "#002204",
        "tertiary-fixed": "#ffdbcb",
        "surface-container-highest": "#e1e3e4",
        "secondary": "#1b6d24",
        "on-error-container": "#93000a",
        "on-error": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "secondary-fixed": "#a3f69c",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#341100",
        "on-background": "#191c1d",
        "surface-container-low": "#f2f4f5",
        "surface-dim": "#d8dadb",
        "error": "#ba1a1a",
        "tertiary": "#5a2200",
        "on-secondary-container": "#217128",
        "surface-container-high": "#e6e8e9",
        "on-primary-container": "#8abcff",
        "secondary-fixed-dim": "#88d982",
        "inverse-on-surface": "#eff1f2",
        "surface-variant": "#e1e3e4",
        "surface-tint": "#27609d",
        "outline": "#727781",
        "background": "#f8fafb"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem", 
        "lg": "0.5rem", 
        "xl": "0.75rem", 
        "full": "9999px"
      },
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
