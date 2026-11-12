import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export async function readJson(path) {
  const text = await readFile(path, 'utf8');
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`Invalid JSON in ${path}: ${error.message}`);
  }
}

export async function writeJsonAtomic(path, value) {
  const absolute = resolve(path);
  const directory = dirname(absolute);
  await mkdir(directory, { recursive: true });
  const temporary = `${absolute}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, absolute);
}
