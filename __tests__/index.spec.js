import plugin from '../src';
import remark from 'remark';
import html from 'remark-html';
import path from 'path';
import cheerio from 'cheerio';
import fs from 'fs';

describe('remark-responsive-images', () => {
  const targetDir = path.join(__dirname, 'fixtures-target');

  const options = {
    srcDir: path.join(__dirname, 'fixtures'),
    targetDir: targetDir,
  };
  const processor = remark()
    .use(html)
    .use([[plugin, options]]);

  beforeEach(() => {
    if (fs.existsSync(targetDir)) {
      fs.rmdirSync(targetDir, { recursive: true });
    }
  });

  it('should return HTML for image', (done) => {
    const input = '![My image](foo.jpg)';

    processor.process(input, (_, file) => {
      const result = cheerio.load(String(file));
      expect(result('figure').length).toBe(1);
      expect(result('picture').length).toBe(1);
      expect(result('source').length).toBe(2);
      expect(result('img').length).toBe(1);
      expect(result('img').attr('alt')).toBe('My image');
      expect(result('figcaption').length).toBe(0);
      done();
    });
  });

  it('should return HTML for image with caption', (done) => {
    const input = '![My image](foo.jpg "My caption")';

    processor.process(input, (_, file) => {
      const result = cheerio.load(String(file));
      expect(result('figure').length).toBe(1);
      expect(result('picture').length).toBe(1);
      expect(result('source').length).toBe(2);
      expect(result('img').length).toBe(1);
      expect(result('img').attr('alt')).toBe('My image');
      expect(result('figcaption').length).toBe(1);
      done();
    });
  });

  it('should return HTML for image that is too small for all sizes', (done) => {
    const input = '![My image](small.jpg)';

    processor.process(input, (_, file) => {
      const result = cheerio.load(String(file));
      expect(result('source').length).toBe(1);
      expect(result('source').attr('srcset')).toBe('small-640.jpg');
      expect(result('img').length).toBe(1);
      expect(result('img').attr('src')).toBe('small-320.jpg');
      expect(result('img').attr('srcset')).toContain('small-640.jpg 2x');
      expect(result('img').attr('srcset')).toContain('small-320.jpg');
      done();
    });
  });

  it('should not modify node if image does not exist', (done) => {
    const input = '![My image](invalid.jpg)';

    processor.process(input, (_, file) => {
      const result = cheerio.load(String(file));
      expect(result('figure').length).toBe(0);
      expect(result('img').length).toBe(1);
      expect(result('img').attr('src')).toBe('invalid.jpg');
      expect(result('img').attr('alt')).toBe('My image');
      done();
    });
  });
});
