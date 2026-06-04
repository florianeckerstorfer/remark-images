import * as fs from 'fs';
import { MANIFEST_VERSION, hashFile, readManifest, writeManifest } from '../src/manifest';

jest.mock('fs');

describe('hashFile()', () => {
  it('returns a 64-char hex string (SHA-256)', () => {
    fs.readFileSync.mockReturnValue(Buffer.from('hello world'));
    const hash = hashFile('/some/file.jpg');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('same content → same hash', () => {
    const content = Buffer.from('same content');
    fs.readFileSync.mockReturnValue(content);
    const hash1 = hashFile('/file1.jpg');
    fs.readFileSync.mockReturnValue(content);
    const hash2 = hashFile('/file2.jpg');
    expect(hash1).toBe(hash2);
  });

  it('different content → different hash', () => {
    fs.readFileSync.mockReturnValue(Buffer.from('content A'));
    const hash1 = hashFile('/file1.jpg');
    fs.readFileSync.mockReturnValue(Buffer.from('content B'));
    const hash2 = hashFile('/file2.jpg');
    expect(hash1).not.toBe(hash2);
  });
});

describe('readManifest()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('file does not exist → returns empty manifest', () => {
    fs.existsSync.mockReturnValue(false);
    const result = readManifest('/nonexistent.json');
    expect(result).toEqual({ version: MANIFEST_VERSION, images: {} });
  });

  it('file exists, valid version → returns parsed manifest', () => {
    const manifest = {
      version: MANIFEST_VERSION,
      images: {
        'foo.jpg': { sourceHash: 'abc123', files: ['foo-320.jpg'] },
      },
    };
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(manifest));
    const result = readManifest('/manifest.json');
    expect(result).toEqual(manifest);
  });

  it('file exists, wrong version → returns empty manifest', () => {
    const manifest = { version: 99, images: { 'foo.jpg': {} } };
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(manifest));
    const result = readManifest('/manifest.json');
    expect(result).toEqual({ version: MANIFEST_VERSION, images: {} });
  });

  it('file exists, invalid JSON → returns empty manifest', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('not valid json {{{{');
    const result = readManifest('/manifest.json');
    expect(result).toEqual({ version: MANIFEST_VERSION, images: {} });
  });
});

describe('writeManifest()', () => {
  it('calls fs.writeFileSync with the correct arguments', () => {
    const manifest = {
      version: MANIFEST_VERSION,
      images: { 'foo.jpg': { sourceHash: 'abc123', files: ['foo-320.jpg'] } },
    };
    writeManifest('/output.json', manifest);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/output.json',
      JSON.stringify(manifest, null, 2) + '\n',
      'utf8'
    );
  });
});
