import { getSrcSet, getSrcSets } from '../src/srcSetHelpers';
import * as FileHelpers from '../src/fileHelpers';
import * as fs from 'fs';
import * as ProbeImageSize from 'probe-image-size';

jest.mock('../src/fileHelpers');
jest.mock('fs');
jest.mock('probe-image-size');

const srcDir = 'site';
const fileName = 'foo.jpg';
const width = 320;
const resolutions = [1, 2];
const staticPrefix = '/prefix/';

describe('getSrcSet()', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(FileHelpers, 'getFileNameInfo').mockReturnValue(['foo', 'jpg']);
    jest.spyOn(fs, 'createReadStream');
    jest
      .spyOn(ProbeImageSize, 'default')
      .mockResolvedValue({ width: 3000, height: 3000 });
  });

  it('should return src set for multiple resolutions', async () => {
    const srcSet = await getSrcSet({ srcDir, fileName, width, resolutions });

    expect(srcSet[0].srcSet).toEqual(['foo-320.jpg']);
    expect(srcSet[1].srcSet).toEqual(['foo-640.jpg', '2x']);
  });

  it('should return src set for multiple resolutions with a staticPrefix', async () => {
    const srcSet = await getSrcSet({ srcDir, fileName, width, resolutions, staticPrefix });

    expect(srcSet[0].srcSet).toEqual([`${staticPrefix}foo-320.jpg`]);
    expect(srcSet[1].srcSet).toEqual([`${staticPrefix}foo-640.jpg`, '2x']);
  });
});

describe('getSrcSets()', () => {
  jest.spyOn(FileHelpers, 'getFileNameInfo').mockReturnValue(['foo', 'jpg']);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return array of src sets', async () => {
    const widths = [320, 640, 960];
    const srcSets = await Promise.all(
      getSrcSets({ srcDir, fileName, widths, resolutions })
    );

    expect(srcSets[0].width).toBe(320);
    expect(srcSets[0].srcSet[0].srcSet).toEqual(['foo-320.jpg']);
    expect(srcSets[0].srcSet[1].srcSet).toEqual(['foo-640.jpg', '2x']);

    expect(srcSets[1].width).toBe(640);
    expect(srcSets[1].srcSet[0].srcSet).toEqual(['foo-640.jpg']);
    expect(srcSets[1].srcSet[1].srcSet).toEqual(['foo-1280.jpg', '2x']);

    expect(srcSets[2].width).toBe(960);
    expect(srcSets[2].srcSet[0].srcSet).toEqual(['foo-960.jpg']);
    expect(srcSets[2].srcSet[1].srcSet).toEqual(['foo-1920.jpg', '2x']);
  });

  it('should return array of src sets with a staticPrefix', async () => {
    const widths = [320, 640, 960];
    const srcSets = await Promise.all(
      getSrcSets({ srcDir, fileName, widths, resolutions, staticPrefix })
    );

    expect(srcSets[0].width).toBe(320);
    expect(srcSets[0].srcSet[0].srcSet).toEqual([`${staticPrefix}foo-320.jpg`]);
    expect(srcSets[0].srcSet[1].srcSet).toEqual([`${staticPrefix}foo-640.jpg`, '2x']);

    expect(srcSets[1].width).toBe(640);
    expect(srcSets[1].srcSet[0].srcSet).toEqual([`${staticPrefix}foo-640.jpg`]);
    expect(srcSets[1].srcSet[1].srcSet).toEqual([`${staticPrefix}foo-1280.jpg`, '2x']);

    expect(srcSets[2].width).toBe(960);
    expect(srcSets[2].srcSet[0].srcSet).toEqual([`${staticPrefix}foo-960.jpg`]);
    expect(srcSets[2].srcSet[1].srcSet).toEqual([`${staticPrefix}foo-1920.jpg`, '2x']);
  });
});

