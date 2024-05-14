import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
  createBundle,
  createTempFiles,
  eraseTempFiles,
  escapeRegExp,
  getTempFiles
} from './helpers.js';
import defaults from '../src/defaults.js';

// Tests
// ============================================================================
describe('file placeholders', async t => {
  it('replaces default placeholder', async t => {
    const { filePlaceholder } = defaults;
    const { fileName, sourceHash } = await createBundle();

    assert.doesNotMatch(fileName, new RegExp(escapeRegExp(filePlaceholder)));
    assert.match(fileName, /bundle-[\d\w]{6}\.js/);
    assert.strictEqual(sourceHash.length, 6);
  });

  it('replaces custom placeholder', async t => {
    const filePlaceholder = '__CUSTOM_PLACEHOLDER__';
    const { fileName, sourceHash } = await createBundle({ filePlaceholder });

    assert.doesNotMatch(fileName, new RegExp(escapeRegExp(filePlaceholder)));
    assert.match(fileName, /bundle-[\d\w]{6}\.js/);
    assert.strictEqual(sourceHash.length, 6);
  });
});

describe('code placeholders', async t => {
  it('replaces default placeholder', async t => {
    const { codePlaceholder } = defaults;
    const { output, sourceHash } = await createBundle();
    const { code } = output[0];

    assert.doesNotMatch(code, new RegExp(escapeRegExp(codePlaceholder)));
    assert.match(code, new RegExp(`TestDefaultPlaceholder: ${sourceHash}`));
  });

  it('replaces custom placeholder', async t => {
    const codePlaceholder = '__CUSTOM_PLACEHOLDER__';
    const { output, sourceHash } = await createBundle({ codePlaceholder });
    const { code } = output[0];

    assert.doesNotMatch(code, new RegExp(escapeRegExp(codePlaceholder)));
    assert.match(code, new RegExp(`TestCustomPlaceholder: ${sourceHash}`));
  });
});

describe('hash', async t => {
  it('accepts hash algorithm', async t => {
    const { sourceHash } = await createBundle({
      hashArgs: 'md5'
    });

    assert.strictEqual(sourceHash.length, 32);
  });

  it('accepts hash options', async t => {
    const { sourceHash } = await createBundle({
      hashArgs: ['shake256', { outputLength: 5 }]
    });

    assert.strictEqual(sourceHash.length, 10);
  });
});

describe('autoDelete', async t => {
  beforeEach(async t => {
    createTempFiles(['bundle-aaaaaa.js', 'bundle-bbbbbb.js', 'bundle-cccccc.js']);
  });

  afterEach(async t => {
    eraseTempFiles();
  });

  it('ignores matching builds when false', async t => {
    await createBundle(
      {
        autoDelete: false
      },
      true
    );

    const tempFiles = getTempFiles();

    assert.strictEqual(tempFiles.length, 4);
  });

  it('deletes matching builds when true', async t => {
    await createBundle(
      {
        autoDelete: true
      },
      true
    );

    const tempFiles = getTempFiles();

    assert.strictEqual(tempFiles.length, 1);
  });
});
