import plugin from '../src/index.js';
import { remark } from 'remark';
import html from 'remark-html';
import path from 'path';

const targetDir = path.join('..', '__tests__', 'fixtures-target');

const options = {
  srcDir: path.join('__tests__', 'fixtures'),
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
