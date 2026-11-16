import { mkdir, readdir, readFile, writeFile, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'public/comics');
const names = (await readdir(source)).filter(name => /^Iron-Lung-(Cover|Page-\d+)\.png$/.test(name));
names.sort((a, b) => a.includes('Cover') ? -1 : b.includes('Cover') ? 1 : a.localeCompare(b, undefined, { numeric: true }));
if (!names.length) throw new Error('No comic pages found in public/comics.');
const pages = await Promise.all(names.map(async name => {
  const bytes = await readFile(path.join(source, name));
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Invalid PNG: ${name}`);
  return { src: `comics/${name}`, label: name.includes('Cover') ? 'Cover' : `Page ${Number(name.match(/Page-(\d+)/)[1])}`, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}));
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'public'), path.join(root, 'dist'), { recursive: true });
for (const file of ['index.html', 'styles.css', 'reader.js']) await copyFile(path.join(root, file), path.join(root, 'dist', file));
await writeFile(path.join(root, 'dist/pages.json'), JSON.stringify(pages, null, 2));
console.log(`Built Rite of Spring: ${pages.length} images, cover first, numbered pages in order.`);
