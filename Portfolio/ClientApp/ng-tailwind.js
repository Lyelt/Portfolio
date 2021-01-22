module.exports = {
  // Tailwind Paths
  configJS: 'tailwind.config.js',
  sourceCSS: 'src/tailwind.scss',
  outputCSS: 'src/styles.scss',
  // Sass
  sass: true,
  // PurgeCSS Settings
  purge: true,
  keyframes: false,
  fontFace: false,
  rejected: false,
  whitelist: ['p-0.5'],
  whitelistPatterns: [],
  whitelistPatternsChildren: [],
  watchRelatedFiles: [],
  extensions: [
    '.ts',
    '.html',
    '.js'
  ],
  extractors: [],
  content: []
};
