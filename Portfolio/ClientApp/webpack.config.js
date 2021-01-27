const { patchPostCSS } = require("@ngneat/tailwind");
const tailwindConfig = require("./tailwind.config.js");
require('dotenv').config();

module.exports = (config) => {
  const purgeEnv = process.env.ENABLE_PURGE;
  const enablePurge = (purgeEnv && purgeEnv === 'true') || false;
  tailwindConfig.purge = enablePurge;
  patchPostCSS(config, tailwindConfig);
  return config;
};
