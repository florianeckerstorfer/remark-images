import renderTag from '../src/renderTag';

describe('renderTag()', () => {
  it('should build HTML for tag with no attributes and no children', () => {
    const html = renderTag('img');

    expect(html).toBe('<img>');
  });

  it('should build HTML for tag with attributes and no children', () => {
    const html = renderTag('img', { alt: 'my alt' });

    expect(html).toBe('<img alt="my alt">');
  });

  it('should build HTML for tag with attributes and text child', () => {
    const html = renderTag('a', { href: 'https://florian.ec' }, 'Florian');

    expect(html).toBe('<a href="https://florian.ec">Florian</a>');
  });

  it('should build HTML for tag with no attributes and children', () => {
    const html = renderTag('span', undefined, 'Foo');

    expect(html).toBe('<span>Foo</span>');
  });

  it('should build HTML for tag with multiple children', () => {
    const html = renderTag('span', undefined, ['Foo', 'Bar']);

    expect(html).toBe('<span>FooBar</span>');
  });

  it('should build HTML without attributes that are null', () => {
    const html = renderTag('img', { title: null });

    expect(html).toBe('<img>');
  });

  it('should build HTML without attributes that are undefined', () => {
    const html = renderTag('img', { title: undefined });

    expect(html).toBe('<img>');
  });

  it('should render with closing tag if `children` is `true`', () => {
    const html = renderTag('span', {}, true);

    expect(html).toBe('<span></span>');
  });

  it('should render style attribute', () => {
    const html = renderTag('span', { style: {
      margin: 0, width: '100%',
    }}, true);

    expect(html).toBe('<span style="margin: 0; width: 100%;"></span>');
  })
});
