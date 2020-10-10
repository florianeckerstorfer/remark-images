import createDebug from 'debug';
import renderTag from './renderTag';

const debug = createDebug('RemarkResponsiveImages');

export function renderCaption({ caption, className }) {
  return renderTag('figcaption', { class: className }, caption);
}

export function renderPicture({ className, sources }) {
  return renderTag('picture', { class: className }, sources);
}

export function renderImg({ srcSet, alt, className, loadingPolicy }) {
  if (!srcSet || !srcSet[0] || !srcSet[0].srcSet || !srcSet[0].srcSet[0]) {
    debug('Skip <img>, no srcset found %o', srcSet);
    return null;
  }

  const loading = ['eager', 'lazy'].includes(loadingPolicy)
    ? loadingPolicy
    : 'eager';

  return renderTag('img', {
    srcset: srcSet.map((s) => s.srcSet.join(' ')).join(', '),
    src: srcSet[0].srcSet[0],
    alt: alt,
    class: className,
    loading,
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
    loadingPolicy: options.loadingPolicy,
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
  if (captionTag) {
    debug('Render <figcaption> for node %o', node);
  }

  return renderTag('figure', { class: options.figureClassName }, [
    pictureTag,
    captionTag,
  ]);
}
