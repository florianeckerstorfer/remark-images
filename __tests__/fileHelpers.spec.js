import fs from 'fs';
import {
  getFileNameInfo,
  noTrailingSlash,
  fileExists,
  isNewerFile,
} from '../src/fileHelpers';

jest.mock('fs');

describe('getFileNameInfo()', () => {
  it('should return base and extension for file name', () => {
    expect(getFileNameInfo('foo.jpg')).toEqual(['foo', 'jpg']);
  });

  it('should return base and extension for file name with path', () => {
    expect(getFileNameInfo('x/y/z/foo.jpg')).toEqual(['x/y/z/foo', 'jpg']);
  });

  it('should return base for file name without extension', () => {
    expect(getFileNameInfo('x/y/z/foo')).toEqual(['x/y/z/foo', '']);
  });

  it('should return empty strings for given empty string', () => {
    expect(getFileNameInfo('')).toEqual(['', '']);
  })
});

describe('noTrailingSlash()', () => {
  it('should remove trailing slash', () => {
    expect(noTrailingSlash('/foo/')).toBe('/foo');
  });

  it('should remove multiple trailing slashes', () => {
    expect(noTrailingSlash('/foo//')).toBe('/foo');
    expect(noTrailingSlash('/foo///')).toBe('/foo');
  });

  it('should return string with no trailing slash', () => {
    expect(noTrailingSlash('/foo')).toBe('/foo');
  });
});

describe('fileExists()', () => {
  const existsMock = jest.spyOn(fs, 'existsSync');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if file exists', () => {
    existsMock.mockReturnValue(true);
    expect(fileExists('foo.jpg')).toBe(true);
  });

  it('should return false if file exists', () => {
    existsMock.mockReturnValue(false);
    expect(fileExists('invalid.jpg')).toBe(false);
  });
});

describe('isNewerFile()', () => {
  const statMock = jest.spyOn(fs, 'statSync');
  const existsMock = jest.spyOn(fs, 'existsSync');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if source is newer than target', () => {
    existsMock.mockReturnValueOnce(true);
    statMock.mockReturnValueOnce({ mtimeMs: 1591183724690 });
    statMock.mockReturnValueOnce({ mtimeMs: 1591183724650 });

    expect(isNewerFile('foo.jpg', 'bar.jpg')).toBe(true);
  });

  it('should return false if source is older than target', () => {
    existsMock.mockReturnValueOnce(true);
    statMock.mockReturnValueOnce({ mtimeMs: 1591183724620 });
    statMock.mockReturnValueOnce({ mtimeMs: 1591183724650 });

    expect(isNewerFile('foo.jpg', 'bar.jpg')).toBe(false);
  });

  it('should return true if target does not exist', () => {
    existsMock.mockReturnValueOnce(false);

    expect(isNewerFile('foo.jpg', 'bar.jpg')).toBe(true);
    expect(statMock).toHaveBeenCalledTimes(0);
  });
});
