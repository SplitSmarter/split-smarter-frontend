/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}",
            "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['"Poppins"', 'sans-serif'],
        roboto: ['"Roboto"', 'sans-serif'],
        notosans: ['"Noto Sans"', 'sans-serif'],
        notosansdevanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        tirodevanagarihindi: ['"Tiro Devanagari Hindi"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}