import createDebug from 'debug';
import path from 'path';
import sharp from 'sharp';
import visitParents from 'unist-util-visit-parents';
import DEFAULT_OPTIONS from './DEFAULT_OPTIONS.js';
import { fileExists, noTrailingSlash } from './fileHelpers.js';
import { generateImages } from './generateImages.js';
import { findParentLinks } from './remarkHelpers.js';
import { renderFigure } from './render.js';
import { getSrcSets } from './srcSetHelpers.js';

const debug = createDebug('RemarkResponsiveImages');

function findMarkdownImageNodes(markdownAST) {
  const markdownImageNodes = [];

  visitParents(markdownAST, ['image', 'imageReference'], (node, ancestors) => {
    const inLink = ancestors.some(findParentLinks);

    if (node.url.match(/\.(png|jpe?g)$/)) {
      debug('Found node - png/jpg image %O', node);
      markdownImageNodes.push({ node, inLink });
    } else {
      debug('Found node - no png/jpg image → skipping %O', node);
    }
  });

  return markdownImageNodes;
}

function responsiveImages(pluginOptions) {
  const options = { ...DEFAULT_OPTIONS, ...pluginOptions };

  options.srcDir = noTrailingSlash(options.srcDir);
  options.targetDir = noTrailingSlash(options.targetDir);

  function transform(markdownAST) {
    const markdownImageNodes = findMarkdownImageNodes(markdownAST);

    debug('Found %d nodes to process', markdownImageNodes.length);

    const promises = markdownImageNodes
      .filter(({ node }) => fileExists(path.join(options.srcDir, node.url)))
      .map(({ node, inLink }) => {
        return new Promise((resolve) => {
          Promise.all(
            getSrcSets({
              srcDir: options.srcDir,
              fileName: node.url,
              widths: options.imageSizes,
              resolutions: options.resolutions,
            })
          ).then((sources) => {
            generateImages({
              srcSets: sources,
              srcDir: options.srcDir,
              sourceFile: node.url,
              targetDir: options.targetDir,
            }).then((generatedImages) => {
              const sourceFile = path.join(options.srcDir, node.url);
              sharp(sourceFile)
                .resize(20, 20)
                .toBuffer({ resolveWithObject: true })
                .then(({ data, info }) => [data.toString('base64'), info])
                .then(([bgImage, bgData]) => {
                  debug(
                    'Generated %d images for node %O',
                    generatedImages,
                    node
                  );
                  resolve({ node, sources, inLink, bgImage, bgData });
                });
            });
          });
        });
      });

    return Promise.all(promises).then((images) => {
      images.map(({ node, sources, inLink, bgImage, bgData }) => {
        const figure = renderFigure({
          node,
          sources: sources.filter((src) => src.srcSet.length > 0),
          inLink,
          bgImage,
          bgData,
          options,
        });
        node.type = 'element';
        node.value = figure;
      });
    });
  }

  return transform;
}

export default responsiveImages;
