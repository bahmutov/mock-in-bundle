# mock-in-bundle ![cypress version](https://img.shields.io/badge/cypress-8.3.1-brightgreen)

> Cypress utility for mocking a module inside a Webpack bundle

[![ci status][ci image]][ci url] [![semantic-release][semantic-image] ][semantic-url]

Watch the video [Mock ES6 Module From Cypress E2E Test](https://youtu.be/RAFdYqRO2vI)

<center>
<h1>DO NOT USE. TOO EARLY ☠️</h1>
</center>

## Install

```shell
$ npm i -D mock-in-bundle
# or using Yarn
$ yarn add -D mock-in-bundle
```

The import the function in your spec

```js
import { mockInBundle } from 'mock-in-bundle'
```

## Supports

This module supports mocking modules served by:

- Webpack v4 in dev mode (unminified)

## API

### Mock a single module

```js
it('mocks named export Age', () => {
  mockInBundle('src/Person.js', { Age: 20 })
  cy.visit('/')
})
```

You can optionally limit the JS bundles to inspect. For example, react-scripts put the application code into the `main.chunk.js`. Pass it as th third argument.

```js
it('mocks named export Age', () => {
  mockInBundle('src/Person.js', { Age: 20 }, 'main.chunk.js')
  cy.visit('/')
})
```

### Mock default export

```js
import { mockInBundle } from 'mock-in-bundle'

it('mocks the Config module', () => {
  mockInBundle('src/Config.tsx', { default: { title: 'Mock Test' } })
  cy.visit('/')
  cy.contains('h1', 'Mock Test')
})
```

### Mock multiple modules

You can mock multiple modules at once by using an object with `[module name]: mocks` format.

```js
// import React so we can mock JSX components
import React from 'react'

it('mocks Person and Timer', () => {
  mockInBundle({
    'src/Person.js': { Age: 20 },
    'src/Timer.js': { default: () => <div>Mock Time</div> },
  })
  cy.visit('/')
})
```

**Tip:** you can pass the bundle name/pattern as the second argument

```js
mockInBundle({
  modules to mock
}, 'main.chunk.js')
```

## Examples

But if you are going to use, at least check out the examples:

- [bahmutov/sudoku-mock-module](https://github.com/bahmutov/sudoku-mock-module)
- [bahmutov/haptics-and-micro-animations](https://github.com/bahmutov/haptics-and-micro-animations) shows how to mock external library in a React Native project served using Expo
- [bahmutov/stub-window-object-example](https://github.com/bahmutov/stub-window-object-example)

## Read

- [When Has The App Loaded](https://glebbahmutov.com/blog/app-loaded/)

## Small print

Author: Gleb Bahmutov &copy; 2021

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog/)
- [videos](https://www.youtube.com/glebbahmutov)

License: MIT - do anything with the code, but don't blame me if it does not work.

Spread the word: tweet, star on github, etc.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/mock-in-bundle/issues) on Github

## MIT License

Copyright (c) 2021 Gleb Bahmutov

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[ci image]: https://github.com/bahmutov/mock-in-bundle/workflows/ci/badge.svg?branch=main
[ci url]: https://github.com/bahmutov/mock-in-bundle/actions
