# remark-images

> Plugin for [Remark](https://remark.js.org/) to make the images in your Markdown responsive.

![Unit tests](https://github.com/florianeckerstorfer/remark-images/workflows/Unit%20tests/badge.svg)

Made by 👨‍💻[Florian Eckerstorfer](https://florian.ec) in beautiful 🎡 Vienna, Europe.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Debugging](#debugging)
4. [Contributing](#contributing)
5. [Code of Conduct](#code-of-conduct)
6. [License](#license)
7. [Change log](#change-log)

## Features

- Generates multiple sizes of images
- Inserts `<source>` tags and `srcset`
- Adds an elastic container to avoid layout jumps
- Show a blurred version of the image while it is loading

## Installation

You need to install `@fec/remark-images` with NPM or Yarn. Since this is a plugin for Remark, I assume you already have Remark installed and configured.

```shell
npm install @fec/remark-images
yarn add @fec/remark-images
```

## Configuration

You can use `@fec/remark-images` like any other Remark plugin:

```javascript
const remark = require('remark');
const images = require('@fec/remark-images');

const processor = remark().use(images);
```

`@fec/remark-images` gives you some options to customise its behaviour:

```javascript
const remark = require('remark');
const images = require('@fec/remark-images');

const processor = remark().use([[images, options]]);
```

### Articles and tutorials

- [Eleventy and Responsive Images](https://florian.ec/blog/eleventy-and-responsive-images/) by Florian Eckerstorfer

### Options

| Option                    | Default value                  | Description                                                                               |
| ------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| `figureClassName`         | `remarkri--figure`             | Name of CSS class for `figure` tag                                                        |
| `pictureClassName`        | `remarkri--picture`            | Name of CSS class for `picture` tag                                                       |
| `imgClassName`            | `remarkri--img`                | Name of CSS class for `img` tag                                                           |
| `figCaptionClassName`     | `remarkri--figcaption`         | Name of CSS class for `figcaption` tag                                                    |
| `resolutions`             | `[1, 2, 3]`                    | Resolutions that should be generated                                                      |
| `imageSizes`              | `[320, 640, 960]`              | Width of the generated images                                                             |
| `srcDir`                  | `.`                            | Directory where to look for images                                                        |
| `targetDir`               | `.`                            | Directory where to save generated images                                                  |
| `loadingPolicy`           | `"eager"`                      | Sets the `loading` attribute on `<img>`, `"lazy"` to load images when they become visible |
| `elasticContainer`        | `true`                         | Insert elastic container to avoid layout jumps when the image loads                       |
| `blurredBackground`       | `true`                         | Add a blurred background while the image is loading                                       |
| `processCaption`          | `(caption) => caption`         | Define a function to process image caption, eg. convert markdown to HTML                  |
| `transformTargetFileName` | `(fileName, data) => fileName` | Define a function to transform the target file name                                       |

#### Process Caption

If you're using markdown in the image captions, you can define a custom function to process the caption before it renders (by default it won't process the caption). Eg.

```js
const remark = require('remark');
const html = require('remark-html');

const processCaption = (markdown) => {
  return remark().use(html).processSync(markdown).toString();
};
```

## Debugging

`@fec/remark-images` uses [debug](https://www.npmjs.com/package/debug) to give you helpful debugging information when something does not work. In debug mode you get information about inspected nodes, skipped images and srcsets and generated images.

```bash
DEBUG=RemarkResponsiveImages node examples/remark-html.js
```

## Contributing

To contribute to `@fec/remark-images`, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Install dependencies: `npm install`
4. Make your changes (and don't forget to update the tests)
5. Don't forgot to run the tests: `npm test`
6. Commit your changes: `git commit -m '<commit_message>'`
7. Push to the original branch: `git push origin <project_name>/<location>`
8. Create the pull request.

Alternatively see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](LICENSE.md).

## Change log

### Version 0.9.0 (November 13, 2023)

- Update dependencies
- Update test matrix to Node 16.x, 17.x, 18.x, 19.x, and 20.x

### Version 0.8.2 (August 4, 2023)

- Update sharp to 0.32.4

### Versiion 0.8.1 (April 30, 2022)

- Fix how target file names are transformed
- Rename `processTargetFileName` option to `transformTargetFileName`

### Version 0.8.0 (April 29, 2022)

- Add callback to process target file names

### Version 0.7.3-alpha (April 23, 2022)

- Use HAST instead of raw HTML
- Bump minimum supported Node.js version to 14.x

### Version 0.6.0-alpha (November 15, 2021)

- [#13](https://github.com/florianeckerstorfer/remark-images/pull/13) Remove empty `srcSet` from generated HTML (by [joostdecock](https://github.com/florianeckerstorfer/remark-images/commits?author=joostdecock))

### Version 0.5.0-alpha (March 20, 2021)

- [#8](https://github.com/florianeckerstorfer/remark-images/pull/8) Add option to process caption (by [amykapernick](https://github.com/amykapernick))
- [#10](https://github.com/florianeckerstorfer/remark-images/pull/10) Add support for Node 15

### Version 0.4.0-alpha (October 19, 2020)

- [#6](https://github.com/florianeckerstorfer/remark-images/pull/6) Add option to add a blurred background

### Version 0.3.0-alpha (October 18, 2020)

- [#5](https://github.com/florianeckerstorfer/remark-images/pull/5) Wrap images in elastic container to avoid layout jumps

### Version 0.2.0-alpha (October 11, 2020)

- Rename package to `@fec/remark-images`

### Version 0.1.3-alpha (October 10, 2020)

- [#4](https://github.com/florianeckerstorfer/remark-images/pull/4) Add debug information

### Version 0.1.2-alpha (October 9, 2020)

- [#3](https://github.com/florianeckerstorfer/remark-images/pull/3) Add option to set loading attribute on image

### Version 0.1.1-alpha (October 9, 2020)

- [#1](https://github.com/florianeckerstorfer/remark-images/pull/1) Only process .png, .jpg and .jpeg files
- [#2](https://github.com/florianeckerstorfer/remark-images/pull/2) Add remark as peer dependency

### Version 0.1.0-alpha (October 9, 2020)

- Initial alpha release
