const eleventyRemark = require('@fec/eleventy-plugin-remark');
const path = require('path');

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(eleventyRemark, {
    plugins: [
      {
        plugin: import('../../dist/remark-images.esm.js'),
        options: {
          srcDir: __dirname,
          targetDir: path.join(__dirname, '_site'),
        },
      },
    ],
  });
};
