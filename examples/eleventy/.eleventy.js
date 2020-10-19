const eleventyRemark = require('@fec/eleventy-plugin-remark');
const path = require('path');

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(eleventyRemark, {
    plugins: [
      {
        plugin: require('../../dist/remark-images.cjs'),
        options: {
          srcDir: __dirname,
          targetDir: path.join(__dirname, '_site'),
        },
      },
    ],
  });
};
