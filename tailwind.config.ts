import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#f5f5f5",
        graysoft: "#d4d4d4",
        grayhard: "#525252"
      }
    }
  },
  plugins: []
};

export default config;
