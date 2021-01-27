const { patchPostCSS } = require("@ngneat/tailwind");
const tailwindConfig = require("./tailwind.config.js");
require('dotenv').config();

module.exports = (config) => {
  const purgeEnv = process.env.ENABLE_PURGE;
  tailwindConfig.purge = !purgeEnv || purgeEnv === 'true';
  patchPostCSS(config, tailwindConfig);
  return config;
};
