import { promises as fs } from 'node:fs';
import { dirname, resolve, join } from 'node:path';

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
}

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await ensureDir(dest);
    const entries = await fs.readdir(src);
    for (const e of entries) {
      await copyRecursive(join(src, e), join(dest, e));
    }
  } else {
    await ensureDir(dirname(dest));
    await fs.copyFile(src, dest);
  }
}

async function main() {
  const root = process.cwd();
  const faRoot = resolve(root, 'node_modules', '@fortawesome', 'fontawesome-free');
  const srcCss = resolve(faRoot, 'css');
  const srcFonts = resolve(faRoot, 'webfonts');
  const destRoot = resolve(root, 'src', 'renderer', 'vendor', 'fontawesome');
  const destCss = resolve(destRoot, 'css');
  const destFonts = resolve(destRoot, 'webfonts');

  try {
    await copyRecursive(srcCss, destCss);
    await copyRecursive(srcFonts, destFonts);
    console.log('[copy-fa] Copied Font Awesome assets to src/renderer/vendor/fontawesome');
  } catch (err) {
    console.warn('[copy-fa] Failed to copy Font Awesome assets. Did you run `npm install`?', err.message || err);
  }
}

main();

