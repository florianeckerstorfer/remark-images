import plugin from '../src';
import { remark } from 'remark';
import html from 'remark-html';
import path from 'path';
import * as cheerio from 'cheerio';
import fs from 'fs';
import sharp from 'sharp';

describe('remark-images integration', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const targetDir = path.join(__dirname, 'fixtures-target-integration');
  const baseOptions = { srcDir: fixturesDir, targetDir };

  function makeProcessor(options = {}) {
    return remark()
      .use(html, { sanitize: false })
      .use([[plugin, { ...baseOptions, ...options }]]);
  }

  beforeEach(() => {
    if (fs.existsSync(targetDir)) {
      fs.readdirSync(targetDir).forEach((f) =>
        fs.unlinkSync(path.join(targetDir, f))
      );
      fs.rmdirSync(targetDir);
    }
  });

  afterAll(() => {
    if (fs.existsSync(targetDir)) {
      fs.readdirSync(targetDir).forEach((f) =>
        fs.unlinkSync(path.join(targetDir, f))
      );
      fs.rmdirSync(targetDir);
    }
  });

  describe('generated image files on disk', () => {
    it('generates all size/resolution variants with correct dimensions', async () => {
      // foo.jpg is 2400×3600; default imageSizes=[320,640,960], resolutions=[1,2,3]
      // unique intrinsic widths: 320, 640, 960, 1280, 1920 (2880 exceeds source width)
      await makeProcessor().process('![Alt](foo.jpg)');

      const expected = [
        { file: 'foo-320.jpg', width: 320, height: 480 },
        { file: 'foo-640.jpg', width: 640, height: 960 },
        { file: 'foo-960.jpg', width: 960, height: 1440 },
        { file: 'foo-1280.jpg', width: 1280, height: 1920 },
        { file: 'foo-1920.jpg', width: 1920, height: 2880 },
      ];

      for (const { file, width, height } of expected) {
        const filePath = path.join(targetDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        const meta = await sharp(filePath).metadata();
        expect(meta.width).toBe(width);
        expect(meta.height).toBe(height);
      }
    });

    it('skips variants that would exceed source dimensions', async () => {
      // small.jpg is 640×960: only 320@1x and 320@2x (=640) fit within source dimensions
      await makeProcessor().process('![Alt](small.jpg)');

      expect(fs.existsSync(path.join(targetDir, 'small-320.jpg'))).toBe(true);
      expect(fs.existsSync(path.join(targetDir, 'small-640.jpg'))).toBe(true);
      expect(fs.existsSync(path.join(targetDir, 'small-960.jpg'))).toBe(false);
      expect(fs.existsSync(path.join(targetDir, 'small-1280.jpg'))).toBe(false);
      expect(fs.existsSync(path.join(targetDir, 'small-1920.jpg'))).toBe(false);
    });

    it('does not write any files for unsupported image formats', async () => {
      await makeProcessor().process('![Alt](foo.gif)');
      expect(fs.existsSync(targetDir)).toBe(false);
    });

    it('generates files matching custom imageSizes and resolutions', async () => {
      // foo.jpg 2400×3600; imageSizes=[400,800], resolutions=[1,2]
      // unique widths: 400 (400@1x), 800 (400@2x / 800@1x deduped), 1600 (800@2x)
      await makeProcessor({ imageSizes: [400, 800], resolutions: [1, 2] }).process(
        '![Alt](foo.jpg)'
      );

      const expected = [
        { file: 'foo-400.jpg', width: 400, height: 600 },
        { file: 'foo-800.jpg', width: 800, height: 1200 },
        { file: 'foo-1600.jpg', width: 1600, height: 2400 },
      ];
      for (const { file, width, height } of expected) {
        const filePath = path.join(targetDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        const meta = await sharp(filePath).metadata();
        expect(meta.width).toBe(width);
        expect(meta.height).toBe(height);
      }
      // Default sizes must not be present
      expect(fs.existsSync(path.join(targetDir, 'foo-320.jpg'))).toBe(false);
      expect(fs.existsSync(path.join(targetDir, 'foo-960.jpg'))).toBe(false);
    });
  });

  describe('srcset references', () => {
    it('every filename in src and srcset attributes has a file on disk', async () => {
      const output = await makeProcessor().process('![Alt](foo.jpg)');
      const $ = cheerio.load(String(output));
      const files = new Set();

      const imgSrc = $('img').attr('src');
      if (imgSrc) files.add(imgSrc);

      $('[srcset]').each((_, el) => {
        $(el)
          .attr('srcset')
          .split(',')
          .forEach((entry) => {
            const filename = entry.trim().split(/\s+/)[0];
            if (filename) files.add(filename);
          });
      });

      expect(files.size).toBeGreaterThan(0);
      for (const filename of files) {
        expect(fs.existsSync(path.join(targetDir, filename))).toBe(true);
      }
    });
  });

  describe('loadingPolicy option', () => {
    it('defaults to eager loading', async () => {
      const output = await makeProcessor().process('![Alt](foo.jpg)');
      expect(cheerio.load(String(output))('img').attr('loading')).toBe('eager');
    });

    it('sets loading="lazy" when loadingPolicy is "lazy"', async () => {
      const output = await makeProcessor({ loadingPolicy: 'lazy' }).process('![Alt](foo.jpg)');
      expect(cheerio.load(String(output))('img').attr('loading')).toBe('lazy');
    });
  });

  describe('elasticContainer option', () => {
    it('wraps picture in a span container by default', async () => {
      const output = await makeProcessor().process('![Alt](foo.jpg)');
      const $ = cheerio.load(String(output));
      expect($('figure > span').length).toBe(1);
      expect($('figure > span > picture').length).toBe(1);
      expect($('figure > picture').length).toBe(0);
    });

    it('places picture directly inside figure when elasticContainer is false', async () => {
      const output = await makeProcessor({ elasticContainer: false }).process('![Alt](foo.jpg)');
      const $ = cheerio.load(String(output));
      expect($('figure > picture').length).toBe(1);
      expect($('figure > span').length).toBe(0);
    });
  });

  describe('blurredBackground option', () => {
    it('includes a base64 background-image on the elastic container by default', async () => {
      const output = String(await makeProcessor().process('![Alt](foo.jpg)'));
      expect(output).toContain('background-image');
      expect(output).toContain('data:image/');
    });

    it('omits background-image when blurredBackground is false', async () => {
      const output = String(
        await makeProcessor({ blurredBackground: false }).process('![Alt](foo.jpg)')
      );
      expect(output).not.toContain('background-image');
    });
  });

  describe('class name options', () => {
    it('applies default class names to all elements', async () => {
      const output = await makeProcessor().process('![Alt](foo.jpg "Caption")');
      const $ = cheerio.load(String(output));
      expect($('figure.remarkri--figure').length).toBe(1);
      expect($('picture.remarkri--picture').length).toBe(1);
      expect($('img.remarkri--img').length).toBe(1);
      expect($('figcaption.remarkri--figcaption').length).toBe(1);
    });

    it('applies custom class names when provided', async () => {
      const output = await makeProcessor({
        figureClassName: 'my-figure',
        pictureClassName: 'my-picture',
        imgClassName: 'my-img',
        figCaptionClassName: 'my-caption',
      }).process('![Alt](foo.jpg "Caption")');
      const $ = cheerio.load(String(output));
      expect($('figure.my-figure').length).toBe(1);
      expect($('picture.my-picture').length).toBe(1);
      expect($('img.my-img').length).toBe(1);
      expect($('figcaption.my-caption').length).toBe(1);
    });
  });

  describe('processCaption option', () => {
    it('renders the caption unmodified by default', async () => {
      const output = await makeProcessor().process('![Alt](foo.jpg "My Caption")');
      expect(cheerio.load(String(output))('figcaption').text()).toBe('My Caption');
    });

    it('applies a processCaption transform to the caption text', async () => {
      const output = await makeProcessor({
        processCaption: (caption) => caption.toUpperCase(),
      }).process('![Alt](foo.jpg "My Caption")');
      expect(cheerio.load(String(output))('figcaption').text()).toBe('MY CAPTION');
    });
  });

  describe('multiple images in one document', () => {
    it('processes every image independently', async () => {
      const input = '![Image 1](foo.jpg)\n\n![Image 2](small.jpg)';
      const output = await makeProcessor().process(input);
      const $ = cheerio.load(String(output));
      expect($('figure').length).toBe(2);
      expect($('img').length).toBe(2);
    });
  });

  describe('image nested inside a link', () => {
    it('processes the image and preserves the surrounding link', async () => {
      const input = '[![Alt](foo.jpg)](https://example.com)';
      const output = await makeProcessor().process(input);
      const $ = cheerio.load(String(output));
      expect($('figure').length).toBe(1);
      expect($('img').attr('alt')).toBe('Alt');
    });
  });

  describe('PNG image support', () => {
    const pngFixture = path.join(fixturesDir, 'test-integration.png');

    beforeAll(async () => {
      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 100, g: 150, b: 200 },
        },
      })
        .png()
        .toFile(pngFixture);
    });

    afterAll(() => {
      if (fs.existsSync(pngFixture)) fs.unlinkSync(pngFixture);
    });

    it('generates PNG output files with correct dimensions', async () => {
      // 800×600 PNG; imageSizes=[320,640], resolutions=[1]
      // 320×240 and 640×480 both fit within the source
      const output = await makeProcessor({
        imageSizes: [320, 640],
        resolutions: [1],
      }).process('![Alt](test-integration.png)');
      const $ = cheerio.load(String(output));

      expect($('figure').length).toBe(1);
      expect($('img').length).toBe(1);

      const expected = [
        { file: 'test-integration-320.png', width: 320, height: 240 },
        { file: 'test-integration-640.png', width: 640, height: 480 },
      ];
      for (const { file, width, height } of expected) {
        const filePath = path.join(targetDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        const meta = await sharp(filePath).metadata();
        expect(meta.width).toBe(width);
        expect(meta.height).toBe(height);
      }
    });
  });
});
