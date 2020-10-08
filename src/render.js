import renderTag from './renderTag';

export function renderCaption({ caption, className }) {
  return renderTag('figcaption', { class: className }, caption);
}

export function renderPicture({ className, sources }) {
  return renderTag('picture', { class: className }, sources);
}

export function renderImg({ srcSet, alt, className }) {
  if (!srcSet || !srcSet[0] || !srcSet[0].srcSet || !srcSet[0].srcSet[0]) {
    return null;
  }

  return renderTag('img', {
    srcset: srcSet.map((s) => s.srcSet.join(' ')).join(', '),
    src: srcSet[0].srcSet[0],
    alt: alt,
    class: className,
  });
}

export function renderSource({ srcSet, width }) {
  return renderTag('source', {
    srcset: srcSet.map((s) => s.srcSet.join(' ')).join(', '),
    media: `(min-width: ${width}px)`,
  });
}

export function renderFigure({ node, sources, options }) {
  const srcSets = [...sources];

  const imgTag = renderImg({
    srcSet: srcSets.shift().srcSet,
    alt: node.alt,
    className: options.imgClassName,
  });

  const sourceTags = srcSets
    .reverse()
    .filter(({ srcSet }) => srcSet.length > 0)
    .map(({ width, srcSet }) => renderSource({ width, srcSet }));

  const pictureTag = renderPicture({
    className: options.pictureClassName,
    sources: [...sourceTags, imgTag],
  });

  const captionTag = node.title
    ? renderCaption({
        caption: node.title,
        className: options.figCaptionClassName,
      })
    : undefined;

  return renderTag('figure', { class: options.figureClassName }, [
    pictureTag,
    captionTag,
  ]);
}
