import createDebug from 'debug';
import fs from 'fs';
import path from 'path';
import probeImageSize from 'probe-image-size';
import { getFileNameInfo } from './fileHelpers.js';

const debug = createDebug('RemarkResponsiveImages');

export function getHeightFromWidth(width, source) {
  return Math.ceil((width / source.width) * source.height);
}

export async function getSrcSet({ srcDir, fileName, width, resolutions, data, transformTargetFileName }) {
  const [base, extension] = getFileNameInfo(fileName);

  const size = await probeImageSize(
    fs.createReadStream(path.join(srcDir, fileName))
  );

  return resolutions
    .map((resolution) => {
      const intrinsicWidth = width * resolution;
      const intrinsicHeight = getHeightFromWidth(intrinsicWidth, size);
      const aspectRatio = intrinsicWidth / intrinsicHeight;
      return {
        src: transformTargetFileName(`${base}-${intrinsicWidth}.${extension}`, data),
        intrinsicWidth,
        intrinsicHeight,
        aspectRatio,
        resolution,
      };
    })
    .filter((img) => {
      const isSmaller =
        img.intrinsicHeight <= size.height && img.intrinsicWidth <= size.width;
      if (isSmaller) {
        debug('Generated source "%s"', img.src);
      } else {
        debug('Skipping source "%s": too big', img.src);
      }
      return isSmaller;
    })
    .map((img) => ({
      ...img,
      width,
      srcSet:
        img.resolution === 1 ? [img.src] : [img.src, `${img.resolution}x`],
    }));
}

export function getSrcSets({ srcDir, fileName, widths, resolutions, data, transformTargetFileName }) {
  const sortedResolutions = [...resolutions].sort();
  const sortedWidths = [...widths].sort();

  return sortedWidths.map((width) => {
    return new Promise((resolve) => {
      getSrcSet({
        srcDir,
        fileName,
        width,
        resolutions: sortedResolutions,
        data,
        transformTargetFileName
      }).then((srcSet) => {
        resolve({
          aspectRatio: (srcSet[0] || {}).aspectRatio || 0,
          srcSet,
          width,
        });
      });
    });
  });
}
