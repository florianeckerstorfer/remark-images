import fs from 'fs';

export function getFileNameInfo(fileName) {
  const match = fileName.match(/(.+?)(\.([A-Za-z0-9]+))?$/) || [];

  return [match[1] || '', match[3] || ''];
}

export function noTrailingSlash(fileName) {
  return fileName.replace(/(.*?)(\/)*$/, '$1');
}

export function fileExists(fileName) {
  return fs.existsSync(fileName);
}

export function isNewerFile(source, target) {
  if (!fileExists(target)) {
    return true;
  }

  const sourceStats = fs.statSync(source);
  const targetStats = fs.statSync(target);

  return sourceStats.mtimeMs > targetStats.mtimeMs;
}
