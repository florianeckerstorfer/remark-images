const plugin = require('../dist/remark-responsive-images.cjs');
const remark = require('remark');
const html = require('remark-html');
const path = require('path');

const targetDir = path.join(__dirname, '..', '__tests__', 'fixtures-target');

const options = {
  srcDir: path.join(__dirname, '..', '__tests__', 'fixtures'),
  targetDir: targetDir,
};
const processor = remark()
  .use(html)
  .use([[plugin, options]]);

const input = `
# Example

![My image](foo.jpg)

![My GIF image](foo.gif)
`;

processor.process(input, (_, file) => {
  console.log(String(file));
});
