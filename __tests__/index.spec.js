import plugin from '../src';
import remark from 'remark';
import html from 'remark-html';
import path from 'path';
import cheerio from 'cheerio';
import fs from 'fs';

describe('remark-images', () => {
  const targetDir = path.join(__dirname, 'fixtures-target');

  const options = {
    srcDir: path.join(__dirname, 'fixtures'),
    targetDir: targetDir,
  };
  const processor = remark()
    .use(html, { sanitize: false })
    .use([[plugin, options]]);

  beforeEach(() => {
    if (fs.existsSync(targetDir)) {
      fs.readdirSync(targetDir).forEach((file) =>
        fs.unlinkSync(path.join(targetDir, file))
      );
      fs.rmdirSync(targetDir);
    }
  });

  it('should return HTML for image', async () => {
    const input = '![My image](foo.jpg)';

    const { contents } = await processor.process(input);
    const result = cheerio.load(contents);
    expect(result('figure').length).toBe(1);
    expect(result('picture').length).toBe(1);
    expect(result('source').length).toBe(2);
    expect(result('img').length).toBe(1);
    expect(result('img').attr('alt')).toBe('My image');
    expect(result('figcaption').length).toBe(0);
  });

  it('should return HTML for image with caption', async () => {
    const input = '![My image](foo.jpg "My caption")';

    const { contents } = await processor.process(input);
    const result = cheerio.load(contents);
    expect(result('figure').length).toBe(1);
    expect(result('picture').length).toBe(1);
    expect(result('source').length).toBe(2);
    expect(result('img').length).toBe(1);
    expect(result('img').attr('alt')).toBe('My image');
    expect(result('figcaption').length).toBe(1);
  });

  it('should return HTML for image that is too small for all sizes', async () => {
    const input = '![My image](small.jpg)';

    const { contents } = await processor.process(input);
    const result = cheerio.load(contents);
    expect(result('source').length).toBe(1);
    expect(result('source').attr('srcset')).toBe('small-640.jpg');
    expect(result('img').length).toBe(1);
    expect(result('img').attr('src')).toBe('small-320.jpg');
    expect(result('img').attr('srcset')).toContain('small-640.jpg 2x');
    expect(result('img').attr('srcset')).toContain('small-320.jpg');
  });

  it('should not modify node if image does not exist', async () => {
    const input = '![My image](invalid.jpg)';

    const { contents } = await processor.process(input);
    const result = cheerio.load(contents);
    expect(result('figure').length).toBe(0);
    expect(result('img').length).toBe(1);
    expect(result('img').attr('src')).toBe('invalid.jpg');
    expect(result('img').attr('alt')).toBe('My image');
  });

  it('should not modify node if image gif', async () => {
    const input = '![My image](foo.gif)';

    const { contents } = await processor.process(input);
    const result = cheerio.load(contents);
    expect(result('figure').length).toBe(0);
    expect(result('img').length).toBe(1);
    expect(result('img').attr('src')).toBe('foo.gif');
    expect(result('img').attr('alt')).toBe('My image');
  });
});
