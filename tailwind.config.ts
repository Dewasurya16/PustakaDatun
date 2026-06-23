import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        instansi: {
          dark: "#1B4332", // Hijau gelap elegan
          light: "#2D6A4F", // Hijau lebih terang
          accent: "#D4AF37", // Aksen emas
          bg: "#F8F9FA", // Background abu-abu sangat terang
        }
      }
    },
  },
  plugins: [],
};
export default config;