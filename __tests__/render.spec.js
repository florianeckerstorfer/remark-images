import cheerio from 'cheerio';
import {
  renderCaption,
  renderPicture,
  renderFigure,
  renderImg,
  renderSource,
} from '../src/render';
import * as FileHelpers from '../src/fileHelpers';
import DEFAULT_OPTIONS from '../src/DEFAULT_OPTIONS';
import srcSetFixture from './fixtures/srcSetFixture';

jest.mock('../src/fileHelpers');

const options = DEFAULT_OPTIONS;

describe('renderCaption()', () => {
  it('should render caption with className', () => {
    const rendered = renderCaption({ caption: 'My caption', className: 'foo' });

    expect(rendered).toBe('<figcaption class="foo">My caption</figcaption>');
  });
});

describe('renderPicture', () => {
  it('should render picture with className', () => {
    const rendered = renderPicture({ sources: '<source />', className: 'foo' });

    expect(rendered).toBe('<picture class="foo"><source /></picture>');
  });
});

describe('renderImg()', () => {
  it('should render img with srcset, src, className and alt', () => {
    const rendered = renderImg({
      className: 'foo',
      alt: 'My alt',
      srcSet: [{ srcSet: ['foo-320.jpg'] }],
    });

    expect(rendered).toBe(
      '<img srcset="foo-320.jpg" src="foo-320.jpg" alt="My alt" class="foo" loading="eager">'
    );
  });

  it('should render img with loading policy', () => {
    const rendered = renderImg({
      className: 'foo',
      alt: 'My alt',
      srcSet: [{ srcSet: ['foo-320.jpg'] }],
      loadingPolicy: 'lazy'
    });

    expect(rendered).toContain(
      'loading="lazy"'
    );
  });

  it('should render img with eager loading policy if value is invalid', () => {
    const rendered = renderImg({
      className: 'foo',
      alt: 'My alt',
      srcSet: [{ srcSet: ['foo-320.jpg'] }],
      loadingPolicy: 'invalid'
    });

    expect(rendered).toContain(
      'loading="eager"'
    );
  });

  it('should return `null` if srcSet is empty', () => {
    expect(renderImg({})).toBeNull();
    expect(renderImg({ srcSet: [] })).toBeNull();
    expect(renderImg({ srcSet: [[]] })).toBeNull();
  });
});

describe('renderSource()', () => {
  it('should render source for srcset', () => {
    const srcSet = [
      { srcSet: ['foo-1280.jpg', '2x'] },
      { srcSet: ['foo-640.jpg'] },
    ];
    const rendered = renderSource({ srcSet, width: 640 });

    expect(rendered).toBe(
      '<source srcset="foo-1280.jpg 2x, foo-640.jpg" media="(min-width: 640px)">'
    );
  });
});

describe('renderFigure()', () => {
  const existsMock = jest.spyOn(FileHelpers, 'fileExists');
  const getFileNameInfo = jest
    .spyOn(FileHelpers, 'getFileNameInfo')
    .mockReturnValue(['foo', 'jpg']);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should image with alt', () => {
    existsMock.mockReturnValue(true);

    const node = { type: 'image', alt: 'my alt', url: 'img.jpg' };

    const rendered = renderFigure({ node, sources: srcSetFixture, options });

    const $ = cheerio.load(rendered);

    expect($('figure').html().length).toBeGreaterThan(0);
    expect($('figure').attr('class')).toBe(options.figureClassName);

    expect($('picture').html().length).toBeGreaterThan(0);
    expect($('picture').attr('class')).toBe(options.pictureClassName);

    expect($('img').attr('class')).toBe(options.imgClassName);
    expect($('img').attr('alt')).toBe('my alt');
    expect($('img').attr('src')).toBe('foo-320.jpg');
    expect($('img').attr('srcset')).toBe(
      'foo-320.jpg, foo-640.jpg 2x, foo-960.jpg 3x'
    );

    expect($('source').first().attr('media')).toBe('(min-width: 960px)');
    expect($('source').first().attr('srcset')).toBe(
      'foo-960.jpg, foo-1920.jpg 2x, foo-2880.jpg 3x'
    );

    expect($('source').last().attr('media')).toBe('(min-width: 640px)');
    expect($('source').last().attr('srcset')).toBe(
      'foo-640.jpg, foo-1280.jpg 2x, foo-1920.jpg 3x'
    );
  });

  it('should render image with caption', () => {
    existsMock.mockReturnValue(true);

    const node = {
      type: 'image',
      alt: 'my alt',
      title: 'my caption',
      url: 'img.jpg',
    };
    const rendered = renderFigure({ node, sources: srcSetFixture, options });

    const $ = cheerio.load(rendered);

    expect($('figcaption').attr('class')).toBe(options.figCaptionClassName);
    expect($('figcaption').text()).toBe('my caption');
  });
});
