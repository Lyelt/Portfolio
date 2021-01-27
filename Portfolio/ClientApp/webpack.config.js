const { patchPostCSS } = require("@ngneat/tailwind");
const tailwindConfig = require("./tailwind.config.js");
require('dotenv').config();

module.exports = (config) => {
  const purgeEnv = process.env.ENABLE_PURGE;
  tailwindConfig.purge = purgeEnv === null || purgeEnv === 'true';
  console.log("Tailwind purging CSS: " + tailwindConfig.purge);
  patchPostCSS(config, tailwindConfig);
  return config;
};
