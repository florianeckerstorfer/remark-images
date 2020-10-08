import { getFileNameInfo } from './fileHelpers';
import probeImageSize from 'probe-image-size';
import path from 'path';
import fs from 'fs';

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
      return intrinsicHeight <= size.height && img.intrinsicWidth <= size.width;
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
