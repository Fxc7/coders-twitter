
# coders-twitter

A simple and practical Twitter downloader that is easy to integrate. You can integrate it into your project that requires downloading Twitter videos and image or just to get Twitter metadata via a link.

## Features

#### download()
- get metadata video/image url
#### getPostUser()
- get metadata user twitter with posted url
#### stalker()
- get metadata user twitter


## Installation

Install coders-twitter with:

## NPM

```
npm install coders-twitter
```
## PNPM
```
pnpm install coders-twitter
```
## YARN
```
yarn install coders-twitter
```
## Usage/Examples

### ESM
```js
import CodersTwitter from 'coders-twitter';

(async (url) => {
  try {
    const init = new CodersTwitter(); // can also new CodersTwitter(url);
    // If there is no URL argument in the constructor, you can add the method below.
    init.setArgument(url);
    const result = await init.download();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
})('https://x.com/NetflixID/status/1895081447482105999');
```

### CommonJS
```js
const CodersTwitter = require('coders-twitter');

(async (url) => {
  try {
    const init = new CodersTwitter(); // can also new CodersTwitter(url);
    // If there is no URL argument in the constructor, you can add the method below.
    init.setArgument(url);
    const result = await init.download();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
})('https://x.com/NetflixID/status/1895081447482105999');
```

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)


## Authors

- [@Fxc7](https://www.github.com/Fxc7)


## Feedback

If you have any feedback, please reach out to us at farhanxcode7@gmail.com