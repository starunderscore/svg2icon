import { rmSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argDir = process.argv[2];
const releaseDir = argDir ? resolve(process.cwd(), argDir) : join(process.cwd(), 'release');

function safeRemove(targetPath) {
  try {
    rmSync(targetPath, { recursive: true, force: true });
    console.log('Removed', targetPath);
  } catch (e) {
    console.warn('Skip remove', targetPath, e?.message || e);
  }
}

try {
  const entries = readdirSync(releaseDir);
  for (const name of entries) {
    const full = join(releaseDir, name);
    const isDir = statSync(full).isDirectory();
    // Remove unpacked intermediate folders and electron-builder debug files
    if (isDir && /-unpacked$/.test(name)) {
      safeRemove(full);
      continue;
    }
    if (!isDir && (name === 'builder-debug.yml' || name === 'builder-effective-config.yaml')) {
      safeRemove(full);
      continue;
    }
  }
} catch (e) {
  console.warn('Nothing to trim or release folder missing:', e?.message || e);
}
