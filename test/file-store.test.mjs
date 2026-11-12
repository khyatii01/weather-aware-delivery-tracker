import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeJsonAtomic, readJson } from '../src/file-store.mjs';

test('writes valid JSON atomically', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'weather-delay-'));
  try {
    const path = join(directory, 'nested', 'orders.json');
    await writeJsonAtomic(path, [{ order_id: '1001' }]);
    assert.deepEqual(await readJson(path), [{ order_id: '1001' }]);
    assert.match(await readFile(path, 'utf8'), /"order_id": "1001"/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
