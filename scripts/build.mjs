import { mkdir, readdir, readFile, writeFile, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'public/comics');
const output = path.join(root, 'dist');
const names = await readdir(source);

async function describePage(name, label) {
  const bytes = await readFile(path.join(source, name));
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Invalid PNG: ${name}`);
  return { src: `comics/${name}`, label, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const sessions = [
  { title: 'Iron-Lung-Cover.png', label: 'Cover', numbered: /^Iron-Lung-Page-(\d+)\.png$/, manifest: 'pages.json' },
  { title: 'Iron-Lung-Session-02-Title.png', label: 'Title page', numbered: /^Iron-Lung-Session-02-Page-(\d+)\.png$/, manifest: 'pages-session-2.json' },
];
await mkdir(output, { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true });
for (const file of ['index.html', 'reader.html', 'styles.css', 'reader.js']) {
  await copyFile(path.join(root, file), path.join(output, file));
}
for (const { title, label, numbered, manifest } of sessions) {
  const numberedPages = names.flatMap(name => {
    const match = name.match(numbered);
    return match ? [{ name, number: Number(match[1]) }] : [];
  }).sort((a, b) => a.number - b.number);
  const cover = await describePage(title, label);
  const pages = await Promise.all(numberedPages.map(({ name, number }) => describePage(name, `Page ${number}`)));
  await writeFile(path.join(output, manifest), JSON.stringify([cover, ...pages], null, 2));
}
console.log('Built Rite of Spring with both sessions.');
