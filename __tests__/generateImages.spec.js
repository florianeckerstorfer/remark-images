import * as Sharp from 'sharp';
import * as ProbeImageSize from 'probe-image-size';
import {
  getHeightFromWidth,
  generateImage,
  generateImages,
} from '../src/generateImages';
import * as FileHelpers from '../src/fileHelpers';
import srcSetFixture from './fixtures/srcSetFixture';
import path from 'path';
import * as fs from 'fs';

jest.mock('sharp');
jest.mock('probe-image-size');
jest.mock('../src/fileHelpers');
jest.mock('fs');

describe('getHeightFromWidth()', () => {
  it('should return height for given width and source image', () => {
    expect(getHeightFromWidth(100, { width: 500, height: 500 })).toBe(100);
    expect(getHeightFromWidth(100, { width: 500, height: 250 })).toBe(50);
    expect(getHeightFromWidth(100, { width: 500, height: 1000 })).toBe(200);
  });
});

describe('generateImage()', () => {
  const sharpMock = jest.spyOn(Sharp, 'default');
  const resizeMock = jest.fn();
  const toFileMock = jest.fn();
  const sharpReturn = { resize: resizeMock, toFile: toFileMock };
  const existsMock = jest.spyOn(FileHelpers, 'fileExists');

  beforeEach(() => {
    jest.clearAllMocks();

    sharpMock.mockReturnValue(sharpReturn);
    resizeMock.mockReturnValue(sharpReturn);
  });

  it('should generate image', async () => {
    existsMock.mockReturnValue(true);
    toFileMock.mockResolvedValue({
      format: 'jpeg',
      width: 320,
      height: 214,
      channels: 3,
      premultiplied: false,
      size: 17986,
    });

    const sourceFile = path.dirname(__dirname, 'fixtures', 'foo.jpg');
    const targetFile = './test-florian.jpg';
    const width = 320;
    const height = 214;
    const done = await generateImage({ sourceFile, targetFile, width, height });

    expect(done).toBe(true);
    expect(sharpMock).toHaveBeenCalledTimes(1);
    expect(resizeMock).toHaveBeenCalledTimes(1);
    expect(resizeMock).toHaveBeenCalledWith({ width, height });
    expect(toFileMock).toHaveBeenCalledTimes(1);
    expect(toFileMock).toHaveBeenCalledWith(targetFile);
  });

  it('should create directory before generating images', async () => {
    const mkdirMock = jest.spyOn(fs, 'mkdirSync');

    existsMock.mockReturnValue(false);
    toFileMock.mockResolvedValue({
      format: 'jpeg',
      width: 320,
      height: 214,
      channels: 3,
      premultiplied: false,
      size: 17986,
    });

    const sourceFile = path.dirname(__dirname, 'fixtures', 'foo.jpg');
    const targetFile = './test-florian.jpg';
    const width = 320;
    const height = 214;
    const done = await generateImage({ sourceFile, targetFile, width, height });

    expect(mkdirMock).toHaveBeenCalledTimes(1);
    expect(mkdirMock.mock.calls[0][0]).toBe('.');
  });
});

describe('generateImages()', () => {
  const probeImageSizeMock = jest.spyOn(ProbeImageSize, 'default');
  const sharpMock = jest.spyOn(Sharp, 'default');
  const resizeMock = jest.fn();
  const toFileMock = jest.fn();
  const sharpReturn = { resize: resizeMock, toFile: toFileMock };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(fs, 'createReadStream');

    sharpMock.mockReturnValue(sharpReturn);
    resizeMock.mockReturnValue(sharpReturn);
    toFileMock.mockResolvedValue({ size: 17986 });

    probeImageSizeMock.mockResolvedValue({ width: 6000, height: 4000 });
  });

  it('should generate all images in srcSet', async () => {
    jest.spyOn(FileHelpers, 'isNewerFile').mockReturnValue(true);
    const processTargetFileName = jest.fn();
    processTargetFileName.mockImplementation(targetFile => targetFile);

    const srcDir = path.dirname(__dirname, 'fixtures');
    const targetDir = 'test/target';
    const done = await generateImages({
      srcSets: srcSetFixture,
      sourceFile: 'foo.jpg',
      srcDir,
      targetDir,
      processTargetFileName,
    });

    expect(done).toBe(6);

    expect(resizeMock).toHaveBeenCalledTimes(6);
    expect(resizeMock.mock.calls[0][0]).toEqual({ width: 320, height: 214 });
    expect(resizeMock.mock.calls[1][0]).toEqual({ width: 640, height: 427 });
    expect(resizeMock.mock.calls[2][0]).toEqual({ width: 960, height: 640 });
    expect(resizeMock.mock.calls[3][0]).toEqual({ width: 1280, height: 854 });
    expect(resizeMock.mock.calls[4][0]).toEqual({ width: 1920, height: 1280 });
    expect(resizeMock.mock.calls[5][0]).toEqual({ width: 2880, height: 1920 });

    expect(toFileMock).toHaveBeenCalledTimes(6);
    expect(toFileMock.mock.calls[0][0]).toBe(`${targetDir}/foo-320.jpg`);
    expect(toFileMock.mock.calls[1][0]).toBe(`${targetDir}/foo-640.jpg`);
    expect(toFileMock.mock.calls[2][0]).toBe(`${targetDir}/foo-960.jpg`);
    expect(toFileMock.mock.calls[3][0]).toBe(`${targetDir}/foo-1280.jpg`);
    expect(toFileMock.mock.calls[4][0]).toBe(`${targetDir}/foo-1920.jpg`);
    expect(toFileMock.mock.calls[5][0]).toBe(`${targetDir}/foo-2880.jpg`);
  });

  it('should only generate images that do not exist yet', async () => {
    const processTargetFileName = jest.fn();
    processTargetFileName.mockImplementation(targetFile => targetFile);

    const isNewerFileMock = jest.spyOn(FileHelpers, 'isNewerFile');
    isNewerFileMock.mockReturnValueOnce(true);
    isNewerFileMock.mockReturnValueOnce(false);
    isNewerFileMock.mockReturnValueOnce(false);
    isNewerFileMock.mockReturnValueOnce(true);
    isNewerFileMock.mockReturnValueOnce(false);
    isNewerFileMock.mockReturnValueOnce(true);

    const srcDir = path.dirname(__dirname, 'fixtures');
    const targetDir = 'test/target';
    const done = await generateImages({
      srcSets: srcSetFixture,
      sourceFile: 'foo.jpg',
      srcDir,
      targetDir,
      processTargetFileName,
    });

    expect(done).toBe(3);

    expect(toFileMock).toHaveBeenCalledTimes(3);
    expect(toFileMock.mock.calls[0][0]).toBe(`${targetDir}/foo-320.jpg`);
    expect(toFileMock.mock.calls[1][0]).toBe(`${targetDir}/foo-1280.jpg`);
    expect(toFileMock.mock.calls[2][0]).toBe(`${targetDir}/foo-2880.jpg`);
  });
});
