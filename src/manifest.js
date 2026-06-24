import { createHash } from 'crypto';
import fs from 'fs';

export const MANIFEST_VERSION = 1;

export function hashFile(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export function readManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return { version: MANIFEST_VERSION, images: {} };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (
      raw.version === MANIFEST_VERSION &&
      raw.images &&
      typeof raw.images === 'object' &&
      !Array.isArray(raw.images)
    ) {
      return raw;
    }
    return { version: MANIFEST_VERSION, images: {} };
  } catch {
    return { version: MANIFEST_VERSION, images: {} };
  }
}

export function writeManifest(manifestPath, manifest) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}
