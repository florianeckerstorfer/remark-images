import fs from 'fs';
import path from 'path';
import probeImageSize from 'probe-image-size';
import sharp from 'sharp';
import { fileExists, isNewerFile } from './fileHelpers';

export function getHeightFromWidth(width, source) {
  return Math.ceil((width / source.width) * source.height);
}

export async function generateImage({ sourceFile, targetFile, width, height }) {
  const targetDir = path.dirname(targetFile);
  if (!fileExists(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const result = await sharp(sourceFile)
    .resize({ width, height })
    .toFile(targetFile);
  return result.size > 0;
}

export async function generateImages({
  srcSets,
  srcDir,
  targetDir,
  sourceFile,
}) {
  const addDirToFiles = (image) => ({
    width: image.width,
    sourceFile: path.join(srcDir, image.sourceFile),
    targetFile: path.join(targetDir, image.targetFile),
  });

  const images = [];
  srcSets.forEach((srcSet) => {
    srcSet.srcSet.forEach((img) => {
      if (!images.find((i) => i.width === img.intrinsicWidth)) {
        images.push({
          width: img.intrinsicWidth,
          sourceFile,
          targetFile: img.src,
        });
      }
    });
  });

  const queue = images
    .map(addDirToFiles)
    .filter((image) => isNewerFile(image.sourceFile, image.targetFile))
    .map((image) =>
      new Promise((resolve) => {
        probeImageSize(fs.createReadStream(image.sourceFile)).then((result) => {
          resolve({
            ...image,
            height: getHeightFromWidth(image.width, result),
          });
        });
      }).then(generateImage)
    );

  const results = await Promise.all(queue);
  return results.filter((r) => r).length;
}
