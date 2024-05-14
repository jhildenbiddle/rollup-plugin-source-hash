# rollup-plugin-source-hash

[![NPM](https://img.shields.io/npm/v/rollup-plugin-source-hash.svg?style=flat-square)](https://www.npmjs.com/package/rollup-plugin-source-hash)
[![GitHub Workflow Status (main)](https://img.shields.io/github/actions/workflow/status/jhildenbiddle/rollup-plugin-source-hash/test.yml?branch=main&label=checks&style=flat-square)](https://github.com/jhildenbiddle/rollup-plugin-source-hash/actions?query=branch%3Amain+)
[![Codacy code quality](https://img.shields.io/codacy/grade/d3ea7fdae22f46fe855d5c2435b03e2a/main?style=flat-square)](https://app.codacy.com/gh/jhildenbiddle/rollup-plugin-source-hash/dashboard?branch=main)
[![Codacy branch coverage](https://img.shields.io/codacy/coverage/d3ea7fdae22f46fe855d5c2435b03e2a/main?style=flat-square)](https://app.codacy.com/gh/jhildenbiddle/rollup-plugin-source-hash/dashboard?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/rollup-plugin-source-hash/blob/main/LICENSE)
[![Sponsor this project](https://img.shields.io/static/v1?style=flat-square&label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/jhildenbiddle)

A [rollup.js](https://rollupjs.org) plugin that inserts hash values based on the pre-bundled source code into a bundle's code and/or filename.

## Features

- Generates hash values based on pre-bundled source code
- Inserts hash values in bundle code and filenames
- Supports custom placeholders
- Deletes outdated bundles on each build (optional)

## Why?

Rollup's built-in [`[hash]`](https://rollupjs.org/configuration-options/#output-entryfilenames) naming option and various hash-related [plugins](https://github.com/phamann/rollup-plugin-hash) generate hash values based on the bundled output. This means bundles created from the same source that use different rollup configurations (output format, transpilation, minification, comments, etc.) will generate different hash values:

```shell
# Rollup [hash] and other plugins
# Same source code, different hash for each file
bundle-742cd4.cjs
bundle-ddc4fb.js
bundle-8023f4.min.js
bundle-c463f6.mjs
```

This plugin generates hash values based on the source code _before_ Rollup has completed its bundling process. As a result, bundles created from the same source code will generate the same hash value regardless of the rollup configuration used to create them. This hash value serves as a build ID, easily identifying all bundles generated from the same source code:

```shell
# This plugin
# Same source code, same hash for each file
bundle-742cd4.cjs
bundle-742cd4.js
bundle-742cd4.min.js
bundle-742cd4.mjs
```

This plugin can also inject a generated hash value into the bundled output:

```js
// Source
const hash = '__SOURCEHASH__'; // Default
```

```js
// Bundle output
const hash = 'ddc4fb';
```

## Installation

**NPM**

```bash
npm install --save-dev rollup-plugin-source-hash
```

## Usage

```js
// Rollup configuration
import sourceHash from 'rollup-plugin-source-hash';

export default {
  input: 'main.js',
  output: {
    file: 'bundle-[sourcehash].js' // Default
  },
  plugins: [
    sourceHash({
      // Options...
    })
  ]
};
```

The [filePlaceholder](#fileplaceholder) value will be replaced with the generated source hash:

```shell
# Bundle file
bundle-742cd4.js
```

All [codePlaceholders](#codeplaceholder) will be replaced with the generated source hash:

```js
// Source: main.js
const hash = '__SOURCEHASH__'; // Default
```

```js
// Bundle: bundle-742cd4.js
const hash = '742cd4';
```

## Options

### autoDelete

- Type: `boolean`
- Default: `true`

Determines if previous builds will be automatically deleted when new builds are generated.

```js
sourceHash({
  autoDelete: true // Default
});
```

The plugin will search for previous builds in the same output directory and match files based on the name pattern and hash value length. For example, if a name pattern of `"bundle-[sourcehash].js"` is used to generate a new bundle named `bundle-742cd4.js`, all files that start with `bundle-`, are followed by an eight character alphanumeric value, and end with `.js` will be deleted.

```js
// Rollup configuration
output: {
  file: 'bundle-[sourcehash].js'; // Default
}
```

```shell
# Bundle file
bundle-742cd4.js
```

```shell
# These files will be deleted
bundle-ddc4fb.js
bundle-8023f4.js
bundle-c463f6.js

# These files will not be deleted
bundle.js
bundle-acbd18db4cc2f85cedef654fccc4a4d8.js
```

### codePlaceholder

- Type: `string`
- Default: `"__SOURCEHASH__"`;

The source code placeholder string to replace with the generated hash value.

```js
sourceHash({
  codePlaceholder: '__SOURCEHASH__'
});
```

### filePlaceholder

- Type: `string`
- Default: `"[sourcehash]"`

The bundle file name placeholder string to replace with the generated hash value.

```js
sourceHash({
  filePlaceholder: '[sourcehash]'
});
```

### hashArgs

- Type: `array|string`
- Default: `["shake256", { outputLength: 3 }]`

The arguments to pass to Node's [crypto.createHash](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options) method.

```js
// Array
sourceHash({
  hashArgs: ['shake256', { outputLength: 3 }]
});

// String
sourceHash({
  hashArgs: 'md5'
});
```

From the Node.js [createHash](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options) documentation:

> The `algorithm` is dependent on the available algorithms supported by the version of OpenSSL on the platform. Examples are `'sha256'`, `'sha512'`, etc. On recent releases of OpenSSL, `openssl list -digest-algorithms` will display the available digest algorithms.
>
> For XOF hash functions such as `'shake256'`, the `outputLength` option can be used to specify the desired output length in bytes.

## Sponsorship

A [sponsorship](https://github.com/sponsors/jhildenbiddle) is more than just a way to show appreciation for the open-source authors and projects we rely on; it can be the spark that ignites the next big idea, the inspiration to create something new, and the motivation to share so that others may benefit.

If you benefit from this project, please consider lending your support and encouraging future efforts by [becoming a sponsor](https://github.com/sponsors/jhildenbiddle).

Thank you! 🙏🏻

## Contact & Support

- Follow 👨🏻‍💻 **@jhildenbiddle** on [Twitter](https://twitter.com/jhildenbiddle) and [GitHub](https://github.com/jhildenbiddle) for announcements
- Create a 💬 [GitHub issue](https://github.com/jhildenbiddle/rollup-plugin-source-hash/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/jhildenbiddle/rollup-plugin-source-hash) and 🐦 [tweet](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Frollup-plugin-source-hash&hashtags=css,developers,frontend,javascript) to promote the project
- Become a 💖 [sponsor](https://github.com/sponsors/jhildenbiddle) to support the project and future efforts

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/jhildenbiddle/rollup-plugin-source-hash/blob/main/LICENSE) for details.

Copyright (c) John Hildenbiddle ([@jhildenbiddle](https://twitter.com/jhildenbiddle))
