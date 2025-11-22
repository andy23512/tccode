const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    fontFamily: {
      code: ['Consolas', 'Courier New', 'monospace'],
    },
    colors: {
      primary: '#39C5BB',
      secondary: '#FC4769',
    },
  },
  plugins: [],
};
