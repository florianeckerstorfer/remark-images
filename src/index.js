import path from 'path';
import visitWithParents from 'unist-util-visit-parents';
import DEFAULT_OPTIONS from './DEFAULT_OPTIONS';
import { fileExists, noTrailingSlash } from './fileHelpers';
import { generateImages } from './generateImages';
import { findParentLinks } from './remarkHelpers';
import { renderFigure } from './render';
import { getSrcSets } from './srcSetHelpers';

function findMarkdownImageNodes(markdownAST) {
  const markdownImageNodes = [];

  visitWithParents(
    markdownAST,
    ['image', 'imageReference'],
    (node, ancestors) => {
      const inLink = ancestors.some(findParentLinks);

      markdownImageNodes.push({ node, inLink });
    }
  );

  return markdownImageNodes;
}

function responsiveImages(pluginOptions) {
  const options = { ...DEFAULT_OPTIONS, ...pluginOptions };

  options.srcDir = noTrailingSlash(options.srcDir);
  options.targetDir = noTrailingSlash(options.targetDir);

  function transform(markdownAST) {
    const markdownImageNodes = findMarkdownImageNodes(markdownAST);

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
              resolve({ node, sources, inLink });
            });
          });
        });
      });

    return Promise.all(promises).then((images) => {
      images.forEach(({ node, sources, inLink }) => {
        const rawHtml = renderFigure({ node, sources, inLink, options });
        node.type = 'html';
        node.value = rawHtml;
      });
    });
  }

  return transform;
}

export default responsiveImages;
