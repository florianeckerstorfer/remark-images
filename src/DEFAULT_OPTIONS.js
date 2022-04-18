const DEFAULT_OPTIONS = {
  imgClassName: 'remarkri--img',
  figureClassName: 'remarkri--figure',
  figCaptionClassName: 'remarkri--figcaption',
  pictureClassName: 'remarkri--picture',
  resolutions: [1, 2, 3],
  imageSizes: [320, 640, 960],
  srcDir: '.',
  targetDir: '.',
  loadingPolicy: 'eager',
  elasticContainer: true,
  blurredBackground: true,
  processCaption: (caption) => caption,
};

export default DEFAULT_OPTIONS;
