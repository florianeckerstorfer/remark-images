import * as cheerio from 'cheerio';
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

const noElasticOptions = {
  ...DEFAULT_OPTIONS,
  elasticContainer: false,
  blurredBackground: false,
};

const withElasticOptions = { ...DEFAULT_OPTIONS, blurredBackground: false };

const withElasticBlurOptions = { ...DEFAULT_OPTIONS };

describe('renderCaption()', () => {
  it('should render caption with className', () => {
    const rendered = renderCaption({
      caption: 'My caption',
      className: 'foo',
      processCaption: (caption) => caption,
    });

    expect(rendered.tagName).toBe('figcaption');
    expect(rendered.properties.className).toContain('foo');
    expect(rendered.children[0].value).toBe('My caption');
  });

  it('should render processed caption', () => {
    const processCaption = jest.fn().mockImplementation((caption) => caption);
    const rendered = renderCaption({
      caption: 'My caption',
      className: 'foo',
      processCaption,
    });

    expect(rendered.tagName).toBe('figcaption');
    expect(rendered.properties.className).toContain('foo');
    expect(rendered.children[0].value).toBe('My caption');
    expect(processCaption).toHaveBeenCalledTimes(1);
  });
});

describe('renderPicture', () => {
  it('should render picture with className', () => {
    const rendered = renderPicture({ sources: '<source />', className: 'foo' });

    expect(rendered.tagName).toBe('picture');
    expect(rendered.properties.className).toContain('foo');
    expect(rendered.children[0].value).toBe('<source />');
  });
});

describe('renderImg()', () => {
  it('should render img with srcset, src, className and alt', () => {
    const rendered = renderImg({
      className: 'foo',
      alt: 'My alt',
      srcSet: [{ srcSet: ['foo-320.jpg'] }],
    });

    expect(rendered.tagName).toBe('img');
    expect(rendered.properties.className).toContain('foo');
    expect(rendered.properties.loading).toBe('eager');
    expect(rendered.properties.alt).toBe('My alt');
    expect(rendered.properties.src).toBe('foo-320.jpg');
    expect(rendered.properties.srcSet).toContain('foo-320.jpg');
  });

  it('should render img with loading policy', () => {
    const rendered = renderImg({
      className: 'foo',
      alt: 'My alt',
      srcSet: [{ srcSet: ['foo-320.jpg'] }],
      loadingPolicy: 'lazy',
    });

    expect(rendered.properties.loading).toBe('lazy');
  });

  it('should render img with eager loading policy if value is invalid', () => {
    const rendered = renderImg({
      className: 'foo',
      alt: 'My alt',
      srcSet: [{ srcSet: ['foo-320.jpg'] }],
      loadingPolicy: 'invalid',
    });

    expect(rendered.properties.loading).toBe('eager');
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

    expect(rendered.tagName).toBe('source');
    expect(rendered.properties.media).toBe('(min-width: 640px)');
    expect(rendered.properties.srcSet).toContain('foo-1280.jpg 2x');
    expect(rendered.properties.srcSet).toContain('foo-640.jpg');
  });
});

describe('renderFigure()', () => {
  const existsMock = jest.spyOn(FileHelpers, 'fileExists');
  jest.spyOn(FileHelpers, 'getFileNameInfo').mockReturnValue(['foo', 'jpg']);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render image with alt if `elasticContainer` is off', () => {
    existsMock.mockReturnValue(true);

    const node = { type: 'image', alt: 'my alt', url: 'img.jpg' };

    const rendered = renderFigure({
      node,
      sources: srcSetFixture,
      options: noElasticOptions,
    });

    expect(rendered.tagName).toBe('figure');
    expect(rendered.properties.className).toContain(
      noElasticOptions.figureClassName
    );

    const pictureTag = rendered.children[0];
    expect(pictureTag.tagName).toBe('picture');
    expect(pictureTag.properties.className).toContain(
      noElasticOptions.pictureClassName
    );

    const sourceTag1 = pictureTag.children[0];
    expect(sourceTag1.tagName).toBe('source');
    expect(sourceTag1.properties.media).toBe('(min-width: 960px)');
    expect(sourceTag1.properties.srcSet).toContain('foo-960.jpg');
    expect(sourceTag1.properties.srcSet).toContain('foo-1920.jpg 2x');
    expect(sourceTag1.properties.srcSet).toContain('foo-2880.jpg 3x');

    const sourceTag2 = pictureTag.children[1];
    expect(sourceTag2.tagName).toBe('source');
    expect(sourceTag2.properties.media).toBe('(min-width: 640px)');
    expect(sourceTag2.properties.srcSet).toContain('foo-640.jpg');
    expect(sourceTag2.properties.srcSet).toContain('foo-1280.jpg 2x');
    expect(sourceTag2.properties.srcSet).toContain('foo-1920.jpg 3x');

    const imgTag = pictureTag.children[2];
    expect(imgTag.tagName).toBe('img');
    expect(imgTag.properties.className).toContain(
      noElasticOptions.imgClassName
    );
    expect(imgTag.properties.alt).toBe('my alt');
    expect(imgTag.properties.src).toBe('foo-320.jpg');
    expect(imgTag.properties.srcSet).toContain('foo-320.jpg');
    expect(imgTag.properties.srcSet).toContain('foo-640.jpg 2x');
    expect(imgTag.properties.srcSet).toContain('foo-960.jpg 3x');
  });

  it('should render image with elastic container', () => {
    existsMock.mockReturnValue(true);

    const node = { type: 'image', alt: 'my alt', url: 'img.jpg' };

    const rendered = renderFigure({
      node,
      sources: srcSetFixture,
      options: withElasticOptions,
    });

    const spanTag1 = rendered.children[0];
    expect(spanTag1.tagName).toBe('span');
    expect(spanTag1.properties.style).toContain('relative');

    const spanTag2 = spanTag1.children[0];
    expect(spanTag2.tagName).toBe('span');
    expect(spanTag2.properties.style).toContain('relative');
    expect(spanTag2.properties.style).toContain(
      'padding-bottom: 149.9999999925%'
    );

    const imgTag = spanTag1.children[1].children[2];
    expect(imgTag.tagName).toBe('img');
    expect(imgTag.properties.style).toContain('absolute');
  });

  it('should render image with elastic container and blurred background', () => {
    existsMock.mockReturnValue(true);

    const node = { type: 'image', alt: 'my alt', url: 'img.jpg' };

    const rendered = renderFigure({
      node,
      sources: srcSetFixture,
      options: withElasticBlurOptions,
      bgData: { format: 'jpeg' },
    });

    const spanTag1 = rendered.children[0];
    expect(spanTag1.tagName).toBe('span');
    expect(spanTag1.properties.style).toContain('relative');

    const spanTag2 = spanTag1.children[0];
    expect(spanTag2.tagName).toBe('span');
    expect(spanTag2.properties.style).toContain('relative');
    expect(spanTag2.properties.style).toContain(
      'padding-bottom: 149.9999999925%'
    );
    expect(spanTag2.properties.style).toContain(
      'background-image: url(data:image/jpeg;base64,'
    );

    const imgTag = spanTag1.children[1].children[2];
    expect(imgTag.tagName).toBe('img');
    expect(imgTag.properties.style).toContain('absolute');
  });

  it('should render image with caption', () => {
    existsMock.mockReturnValue(true);

    const node = {
      type: 'image',
      alt: 'my alt',
      title: 'my caption',
      url: 'img.jpg',
    };
    const rendered = renderFigure({
      node,
      sources: srcSetFixture,
      options: noElasticOptions,
    });

    expect(rendered.children[1].tagName).toBe('figcaption');
    expect(rendered.children[1].children[0].value).toBe('my caption');
  });
});
