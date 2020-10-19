import createDebug from 'debug';
import renderTag from './renderTag';

const debug = createDebug('RemarkResponsiveImages');

export function renderCaption({ caption, className }) {
  return renderTag('figcaption', { class: className }, caption);
}

export function renderPicture({ className, sources }) {
  return renderTag('picture', { class: className }, sources);
}

export function renderImg({ srcSet, alt, className, loadingPolicy, style }) {
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
    style,
  });
}

export function renderSource({ srcSet, width }) {
  return renderTag('source', {
    srcset: srcSet.map((s) => s.srcSet.join(' ')).join(', '),
    media: `(min-width: ${width}px)`,
  });
}

export function renderFigure({ node, sources, options, bgImage, bgData }) {
  const srcSets = [...sources];

  const aspectRatio = srcSets[0].aspectRatio;

  const imgTagStyle = options.elasticContainer
    ? {
        height: '100%',
        left: 0,
        margin: 0,
        position: 'absolute',
        top: 0,
        'vertical-align': 'middle',
        width: '100%',
      }
    : undefined;

  const imgTag = renderImg({
    srcSet: srcSets.shift().srcSet,
    alt: node.alt,
    className: options.imgClassName,
    loadingPolicy: options.loadingPolicy,
    style: imgTagStyle,
  });

  const sourceTags = srcSets
    .reverse()
    .filter(({ srcSet }) => srcSet.length > 0)
    .map(({ width, srcSet }) => renderSource({ width, srcSet }));

  const pictureTag = renderPicture({
    className: options.pictureClassName,
    sources: [...sourceTags, imgTag],
  });

  const elasticContainerStyle = {
    bottom: 0,
    display: 'block',
    filter: 'blur(50%)',
    left: 0,
    'padding-bottom': `${(1 / aspectRatio) * 100}%`,
    position: 'relative',
  };

  if (options.blurredBackground) {
    const bgDataUrl = `data:image/${bgData.format};base64,${bgImage}`;
    elasticContainerStyle['background-image'] = `url(${bgDataUrl})`;
    elasticContainerStyle['background-repeat'] = 'no-repeat';
    elasticContainerStyle['background-size'] = '100% 100%';
  }

  const bgTag = options.elasticContainer
    ? renderTag('span', { style: elasticContainerStyle }, true)
    : undefined;

  const imageWrapper = options.elasticContainer
    ? renderTag(
        'span',
        {
          style: {
            display: 'block',
            'margin-left': 'auto',
            'margin-right': 'auto',
            overflow: 'hidden',
            position: 'relative',
          },
        },
        [bgTag, pictureTag]
      )
    : undefined;

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
    options.elasticContainer ? imageWrapper : pictureTag,
    captionTag,
  ]);
}
