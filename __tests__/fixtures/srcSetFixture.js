const srcSetFixture = [
  {
    width: 320,
    srcSet: [
      {
        src: 'foo-320.jpg',
        intrinsicWidth: 320,
        resolution: 1,
        width: 320,
        srcSet: ['foo-320.jpg'],
      },
      {
        src: 'foo-640.jpg',
        intrinsicWidth: 640,
        resolution: 2,
        width: 320,
        srcSet: ['foo-640.jpg', '2x'],
      },
      {
        src: 'foo-960.jpg',
        intrinsicWidth: 960,
        resolution: 3,
        width: 320,
        srcSet: ['foo-960.jpg', '3x'],
      },
    ],
  },
  {
    width: 640,
    srcSet: [
      {
        src: 'foo-640.jpg',
        intrinsicWidth: 640,
        resolution: 1,
        width: 640,
        srcSet: ['foo-640.jpg'],
      },
      {
        src: 'foo-1280.jpg',
        intrinsicWidth: 1280,
        resolution: 2,
        width: 640,
        srcSet: ['foo-1280.jpg', '2x'],
      },
      {
        src: 'foo-1920.jpg',
        intrinsicWidth: 1920,
        resolution: 3,
        width: 640,
        srcSet: ['foo-1920.jpg', '3x'],
      },
    ],
  },
  {
    width: 960,
    srcSet: [
      {
        src: 'foo-960.jpg',
        intrinsicWidth: 960,
        resolution: 1,
        width: 960,
        srcSet: ['foo-960.jpg'],
      },
      {
        src: 'foo-1920.jpg',
        intrinsicWidth: 1920,
        resolution: 2,
        width: 960,
        srcSet: ['foo-1920.jpg', '2x'],
      },
      {
        src: 'foo-2880.jpg',
        intrinsicWidth: 2880,
        resolution: 2,
        width: 960,
        srcSet: ['foo-2880.jpg', '3x'],
      },
    ],
  },
];

module.exports = srcSetFixture;
