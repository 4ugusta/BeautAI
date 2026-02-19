/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#a20021',
        teal: '#008080',
        chatBg: '#200007',
        chatAI: '#610014',
        chatUser: '#a20021',
      },
      fontFamily: {
        josefin: ['JosefinSans_400Regular'],
        'josefin-semibold': ['JosefinSans_600SemiBold'],
        'josefin-bold': ['JosefinSans_700Bold'],
      }
    }
  },
  plugins: []
};
