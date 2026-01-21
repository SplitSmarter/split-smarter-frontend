/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        primary: ["var(--font-primary)", "sans-serif"],
        secondary: ["var(--font-secondary)", "sans-serif"],
      },
      colors: {
        // --- Background Colors ---
        'bg-primary': "rgb(var(--color-bg-primary) / <alpha-value>)",
        'bg-primary-lighter': "rgb(var(--color-bg-primary-lighter) / <alpha-value>)",
        'bg-primary-darker': "rgb(var(--color-bg-primary-darker) / <alpha-value>)",
        'bg-canvas': "rgb(var(--color-bg-canvas) / <alpha-value>)",
        'bg-secondary': "rgb(var(--color-bg-secondary) / <alpha-value>)",
        'bg-secondary-lighter': "rgb(var(--color-bg-secondary-lighter) / <alpha-value>)",
        'bg-secondary-darker': "rgb(var(--color-bg-secondary-darker) / <alpha-value>)",
        'bg-overlay': "rgb(var(--color-bg-overlay) / <alpha-value>)",

        // --- Text Colors ---
        'text-primary': "rgb(var(--color-text-primary) / <alpha-value>)",
        'text-primary-placeholder': "rgb(var(--color-text-primary-placeholder) / <alpha-value>)",
        'text-primary-lighter': "rgb(var(--color-text-primary-lighter) / <alpha-value>)",
        'text-primary-darker': "rgb(var(--color-text-primary-darker) / <alpha-value>)",
        'text-secondary': "rgb(var(--color-text-secondary) / <alpha-value>)",
        'text-secondary-lighter': "rgb(var(--color-text-secondary-lighter) / <alpha-value>)",
        'text-secondary-darker': "rgb(var(--color-text-secondary-darker) / <alpha-value>)",
        'text-canvas': "rgb(var(--color-text-canvas) / <alpha-value>)",
        'text-link': "rgb(var(--color-text-link) / <alpha-value>)",

        // --- Icon Colors ---
        'icon-primary': "rgb(var(--color-icon-primary) / <alpha-value>)",
        'icon-primary-lighter': "rgb(var(--color-icon-primary-lighter) / <alpha-value>)",
        'icon-primary-darker': "rgb(var(--color-icon-primary-darker) / <alpha-value>)",
        'icon-secondary': "rgb(var(--color-icon-secondary) / <alpha-value>)",
        'icon-secondary-lighter': "rgb(var(--color-icon-secondary-lighter) / <alpha-value>)",
        'icon-secondary-darker': "rgb(var(--color-icon-secondary-darker) / <alpha-value>)",

        // --- Status Colors ---
        'green-increase': "rgb(var(--color-green-increase) / <alpha-value>)",
        'red-decrease': "rgb(var(--color-red-decrease) / <alpha-value>)",
        'golden': "rgb(var(--color-golden) / <alpha-value>)",

        // --- Semantic Aliases ---
        background: "rgb(var(--bg-background) / <alpha-value>)",
        foreground: "rgb(var(--text-foreground) / <alpha-value>)",
      },
      fontSize: {
        'heading-h1': ['48px', { lineHeight: '1.2' }],
        'heading-h2': ['32px', { lineHeight: '1.2' }],
        'heading-h3': ['24px', { lineHeight: '1.5' }],
        'heading-h4': ['18px', { lineHeight: '1.5' }],
        'body-large': ['18px', { lineHeight: '1.8' }],
        'body-base': ['16px', { lineHeight: '1.8' }],
        'body-small': ['14px', { lineHeight: '1.5' }],
        'caption-xs': ['12px', { lineHeight: '1.2' }],
        'body-xs': ['10px', { lineHeight: '1.2' }], // Added to match your AppText needs
      },
      elevation: {
        '4': '4', // Required for Android elevation in some NativeWind versions
      }
    },
  },
  plugins: [],
}