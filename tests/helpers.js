import path from 'node:path';
import process from 'node:process';
import { rollup } from 'rollup';
import sourceHash from '../src/index.js';
import defaults from '../src/defaults.js';

// Helpers
// ============================================================================
export async function createBundle(sourceHashOptions = {}) {
  const filePlaceholder = sourceHashOptions.filePlaceholder || defaults.filePlaceholder;
  const config = {
    input: path.resolve('src', 'index.js'),
    output: {
      file: `tests/tmp/bundle-${filePlaceholder}.js`,
      format: 'cjs'
    },
    external: ['crypto', 'node:fs', 'node:path'],
    plugins: [sourceHash(sourceHashOptions)]
  };

  try {
    const bundle = await rollup(config);

    const { output } = await bundle.generate(config.output);
    const { fileName } = output[0];
    const fileNameParts = path.basename(config.output.file).split(filePlaceholder);
    const sourceHash = fileNameParts.reduce((acc, part) => acc.replace(part, ''), fileName);

    // await bundle.write(config.output);
    bundle.close();

    return {
      bundle,
      fileName,
      sourceHash,
      output
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
