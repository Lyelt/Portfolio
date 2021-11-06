const { addTailwindPlugin } = require("@ngneat/tailwind");
const tailwindConfig = require("./tailwind.config.js");
require('dotenv').config();

module.exports = (config) => {
  const purgeEnv = process.env.ENABLE_PURGE;
  tailwindConfig.purge.enabled = !purgeEnv || purgeEnv === 'true';
  console.log("tailwindConfig.purge.enabled=" + tailwindConfig.purge.enabled);
  addTailwindPlugin({webpackConfig: config, tailwindConfig: tailwindConfig, patchComponentsStyles: true});
  return config;
};
