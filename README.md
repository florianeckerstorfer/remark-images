# remark-responsive-images

> Plugin for [Remark](https://remark.js.org/) to make the images in your Markdown responsives.

![Unit tests](https://github.com/florianeckerstorfer/remark-responsive-images/workflows/Unit%20tests/badge.svg)

Made by 👨‍💻[Florian Eckerstorfer](https://florian.ec) in beautiful 🎡 Vienna, Europe.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Contributing](#contributing)
4. [Code of Conduct](#code-of-conduct)
5. [License](#license)
6. [Changelog](#changelog)

## Installation

You need to install `@fec/remark-responsive-images` with NPM or Yarn. Since this is a plugin for Remark, I assume you already have Remark installed and configured.

```shell
npm install @fec/remark-responsive-images
yarn add @fec/remark-responsive-images
```

## Configuration

You can use `@fec/remark-responsive-images` like any other Remark plugin:

```javascript
const remark = require('remark');
const images = require('@fec/remark-responsive-images');

const processor = remark().use(images);
```

`@fec/remark-responsive-images` gives you some options to customise its behaviour:

```javascript
const remark = require('remark');
const images = require('@fec/remark-responsive-images');

const processor = remark().use([[images, options]]);
```

### Options

| Option                | Default value          | Description                              |
| --------------------- | ---------------------- | ---------------------------------------- |
| `figureClassName`     | `remarkri--figure`     | Name of CSS class for `figure` tag       |
| `pictureClassName`    | `remarkri--picture`    | Name of CSS class for `picture` tag      |
| `imgClassName`        | `remarkri--img`        | Name of CSS class for `img` tag          |
| `figCaptionClassName` | `remarkri--figcaption` | Name of CSS class for `figcaption` tag   |
| `resolutions`         | `[1, 2, 3]`            | Resolutions that should be generated     |
| `imageSizes`          | `[320, 640, 960]`      | Width of the generated images            |
| `srcDir`              | `.`                    | Directory where to look for images       |
| `targetDir`           | `.`                    | Directory where to save generated images |
| `loadingPolicy`       | `eager`                | Sets the `loading` attribute on `<img>`,  
                                                   `lazy` to load images when they become 
                                                   visible |

## Contributing

To contribute to `@fec/remark-responsive-images`, follow these steps:

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

## Changelog

### Version 0.1.1-alpha (October 9, 2020)

- [#1](https://github.com/florianeckerstorfer/remark-responsive-images/pull/1) Only process .png, .jpg and .jpeg files
- [#2](https://github.com/florianeckerstorfer/remark-responsive-images/pull/2) Add remark as peer dependency

### Version 0.1.0-alpha (October 9, 2020)

- Initial alpha release