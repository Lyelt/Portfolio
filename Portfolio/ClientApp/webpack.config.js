const { patchPostCSS } = require("@ngneat/tailwind");
const tailwindConfig = require("./tailwind.config.js");
require('dotenv').config();

module.exports = (config) => {
  const purgeEnv = process.env.ENABLE_PURGE || null;
  tailwindConfig.purge.enabled = (purgeEnv === null || purgeEnv === 'true');
  console.log("dotenv ENABLE_PURGE variable: " + purgeEnv + " --- Tailwind purging CSS: " + tailwindConfig.purge.enabled);
  patchPostCSS(config, tailwindConfig);
  return config;
};
