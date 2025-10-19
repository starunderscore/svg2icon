import { createHash } from 'node:crypto';
import { createReadStream, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const targetDir = resolve(process.cwd(), process.argv[2] || 'release/linux');

function sha256File(file) {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(file);
    stream.on('data', (d) => hash.update(d));
    stream.on('error', reject);
    stream.on('end', () => resolvePromise(hash.digest('hex')));
  });
}

(async () => {
  const files = readdirSync(targetDir)
    .filter((n) => /\.(AppImage|deb|rpm|exe)$/i.test(n))
    .map((n) => join(targetDir, n))
    .filter((p) => statSync(p).isFile());

  const lines = [];
  for (const f of files) {
    const sum = await sha256File(f);
    lines.push(`${sum}  ${f.split('/').pop()}`);
  }

  if (lines.length) {
    const out = join(targetDir, 'SHA256SUMS.txt');
    writeFileSync(out, lines.join('\n') + '\n');
    console.log('Wrote checksums:', out);
  } else {
    console.log('No artifacts to checksum in', targetDir);
  }
})().catch((e) => {
  console.error('Checksum generation failed:', e?.message || e);
  process.exit(1);
});
