import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { rollup } from 'rollup';
import sourceHash from '../src/index.js';
import defaults from '../src/defaults.js';

export const tmpDir = path.join(import.meta.dirname, '_tmp');

// Bundle Helpers
// ============================================================================
export async function createBundle(sourceHashOptions = {}, writeTrueFalse = false) {
  const filePlaceholder = sourceHashOptions.filePlaceholder || defaults.filePlaceholder;
  const config = {
    input: 'src/index.js',
    output: {
      file: path.join(tmpDir, `bundle-${filePlaceholder}.js`)
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

    if (writeTrueFalse) {
      await bundle.write(config.output);
    }

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

// Temp Files
// ============================================================================
export function createTempFiles(filesArrayOrObject = []) {
  const fileEntries = Array.isArray(filesArrayOrObject)
    ? filesArrayOrObject.map(fileName => [fileName, ''])
    : Object.entries(filesArrayOrObject);

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  fileEntries.forEach(([fileName, fileContent]) => {
    const filePath = path.join(tmpDir, fileName);

    fs.writeFileSync(filePath, fileContent);
  });
}

export function eraseTempFiles() {
  if (!fs.existsSync(tmpDir)) {
    return;
  }

  const tmpFiles = fs.readdirSync(tmpDir);

  tmpFiles.forEach(tmpFile => {
    const tmpFilePath = path.join(tmpDir, tmpFile);

    fs.unlinkSync(tmpFilePath);
  });

  fs.rmdirSync(tmpDir);
}

export function getTempFiles() {
  return fs.readdirSync(tmpDir);
}

// Miscellaneous
// ============================================================================
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
