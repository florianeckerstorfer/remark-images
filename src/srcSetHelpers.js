import createDebug from 'debug';
import fs from 'fs';
import path from 'path';
import probeImageSize from 'probe-image-size';
import { getFileNameInfo } from './fileHelpers';

const debug = createDebug('RemarkResponsiveImages:srcSet');

export function getHeightFromWidth(width, source) {
  return Math.ceil((width / source.width) * source.height);
}

export async function getSrcSet({ srcDir, fileName, width, resolutions }) {
  const [base, extension] = getFileNameInfo(fileName);

  const size = await probeImageSize(
    fs.createReadStream(path.join(srcDir, fileName))
  );

  return resolutions
    .map((resolution) => ({
      src: `${base}-${width * resolution}.${extension}`,
      intrinsicWidth: width * resolution,
      resolution,
    }))
    .filter((img) => {
      const intrinsicHeight = getHeightFromWidth(img.intrinsicWidth, size);
      const isSmaller =
        intrinsicHeight <= size.height && img.intrinsicWidth <= size.width;
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

export function getSrcSets({ srcDir, fileName, widths, resolutions }) {
  const sortedResolutions = [...resolutions].sort();
  const sortedWidths = [...widths].sort();

  return sortedWidths.map((width) => {
    return new Promise((resolve) => {
      getSrcSet({
        srcDir,
        fileName,
        width,
        resolutions: sortedResolutions,
      }).then((srcSet) => resolve({ width, srcSet }));
    });
  });
}
