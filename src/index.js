import { createHash } from 'crypto';
import fs from 'node:fs';
import path from 'node:path';
import defaults from './defaults.js';

/**
 * TEST STRINGS (see: /src/index.js)
 * ============================================================================
 * TestDefaultPlaceholder: __SOURCEHASH__
 * TestCustomPlaceholder: __CUSTOM_PLACEHOLDER__
 * ============================================================================
 */

/**
 * Rollup plugin to replace placeholders in code and file names with a hash
 * based on the source code.
 *
 * @example
 * // Defaults
 * plugins: [
 *   sourceHash({
 *     autoDelete: true,
 *     codePlaceholder: '__SOURCEHASH__',
 *     filePlaceholder: '[sourcehash]',
 *     hashArgs: ['shake256', { outputLength: 3 }]
 *   }),
 * ]
 *
 * @export
 * @param {object} [pluginOptions]
 * @param {boolean} [pluginOptions.autoDelete=true] - Automatically delete
 * outdated builds
 * @param {string} [pluginOptions.codePlaceholder='__SOURCEHASH__'] -
 * Placeholder(s) in source code
 * @param {string} [pluginOptions.filePlaceholder='[sourcehash]'] -
 * Placeholder(s) in file names
 * @param {array|string} [pluginOptions.hashArgs=['shake256', { outputLength: 3 }]] -
 * Arguments to pass to Node's `crypto.createHash` method
 */
export default function sourceHash(pluginOptions = {}) {
  const settings = {
    ...defaults,
    ...pluginOptions
  };

  let hashSrc = '';

  return {
    name: 'sourcehash',
    // 1. Capture all source code before transformation
    transform(code, id) {
      hashSrc += `${code}\n`;
    },
    // 2. Generate hash and replace placeholders
    generateBundle(options, bundle) {
      const { codePlaceholder, filePlaceholder, hashArgs } = settings;
      const hash = createHash(...[hashArgs].flat())
        .update(hashSrc)
        .digest('hex');

      // Replace placeholders with hash
      Object.values(bundle).forEach(bundleData => {
        const { fileName } = bundleData;

        // Code placeholder
        if (codePlaceholder) {
          bundleData.code = bundleData.code.replaceAll(codePlaceholder, hash);
        }

        // File placeholder
        if (filePlaceholder && fileName.includes(filePlaceholder)) {
          bundleData.fileName = bundleData.fileName.replaceAll(filePlaceholder, hash);
        }
      });

      // Delete outdated build(s)
      if (settings.autoDelete) {
        const { dir, file } = options;
        const pathFromDir = dir ? path.resolve(dir) : null;
        const pathFromFile = file ? path.dirname(file) : null;
        const outputPath = pathFromDir || pathFromFile;

        if (!outputPath || !fs.existsSync(outputPath)) {
          return;
        }

        const otherFiles = fs.readdirSync(outputPath);

        Object.entries(bundle)
          .filter(([key, bundleData]) => key.includes(filePlaceholder))
          .forEach(([key, bundleData]) => {
            const [nameBeforeHash, nameAfterHash] = key.split(filePlaceholder);
            const { fileName } = bundleData;
            const reNameWithHash = new RegExp(
              (nameBeforeHash ?? '') + `[\\d\\w]{${hash.length}}` + (nameAfterHash ?? '')
            );

            otherFiles.forEach(otherFile => {
              const isOldHashMatch = otherFile !== fileName && reNameWithHash.test(otherFile);

              if (isOldHashMatch) {
                const oldFilePath = path.resolve(outputPath, otherFile);

                // eslint-disable-next-line no-console
                console.log(`Deleting outdated build: ${otherFile}`);
                fs.unlinkSync(oldFilePath);
              }
            });
          });
      }
    },
    // 3. Cleanup
    closeBundle() {
      hashSrc = '';
    }
  };
}
