/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        paper: '#fdf8f0',
        ink: '#2c2416',
        accent: {
          DEFAULT: '#c45c26',
          light: '#f5e6d3',
        },
      },
      fontFamily: {
        serif: ['KaiTi', 'STKaiti', 'LXGW WenKai', 'serif'],
      },
    },
  },
  plugins: [],
};