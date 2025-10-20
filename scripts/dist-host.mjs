import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

function hasCmd(cmd) {
  const res = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
  return res.status === 0;
}

const platform = process.platform;
const builderCli = resolve(process.cwd(), 'node_modules', 'electron-builder', 'cli.js');

function runBuilder(extraArgs) {
  const res = spawnSync(process.execPath, [builderCli, ...extraArgs], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status || 1);
}

function trim(dir) {
  spawnSync(process.execPath, [resolve('scripts/trim-release.mjs'), dir], { stdio: 'inherit' });
}

function checksums(dir) {
  spawnSync(process.execPath, [resolve('scripts/checksums.mjs'), dir], { stdio: 'inherit' });
}

if (platform === 'linux') {
  const targets = [];
  if (hasCmd('dpkg-deb')) {
    targets.push('deb');
  } else {
    console.log('Skipping DEB build: dpkg-deb not found. Install it to enable DEB output (Ubuntu/Debian: installed by default; Fedora: sudo dnf install dpkg fakeroot).');
  }
  if (hasCmd('rpmbuild')) {
    targets.push('rpm');
  } else {
    console.log('Skipping RPM build: rpmbuild not found. Install it to enable RPM output (Ubuntu/Debian: sudo apt install rpm, Fedora: sudo dnf install rpm-build).');
  }
  const arches = ['x64'];
  for (const arch of arches) {
    const out = `release/linux/${arch}`;
    const archFlag = arch === 'x64' ? '--x64' : arch === 'arm64' ? '--arm64' : '--ia32';
    const args = targets.flatMap(t => ['-l', t]).concat([`-c.directories.output=${out}`, archFlag]);
    runBuilder(args);
    trim(out);
    checksums(out);
  }
  // Optional: cross-build Windows on Linux if Wine is available
  if (hasCmd('wine')) {
    console.log('wine detected: building Windows NSIS (x64) on Linux...');
    const out = `release/win/x64`;
    const args = ['-w', 'nsis', `-c.directories.output=${out}`, '--x64'];
    runBuilder(args);
    trim(out);
    checksums(out);
  } else {
    console.log('Skipping Windows build: wine not found. Install wine64 to enable cross-build.');
  }
} else if (platform === 'win32') {
  // Default to x64 only for v1.0.0 to avoid 32-bit native dependency issues (e.g., sharp)
  const arches = ['x64'];
  for (const arch of arches) {
    const out = `release/win/${arch}`;
    const archFlag = arch === 'x64' ? '--x64' : '--ia32';
    const args = ['-w', 'nsis', `-c.directories.output=${out}`, archFlag];
    runBuilder(args);
    trim(out);
    checksums(out);
  }
} else if (platform === 'darwin') {
  const arches = ['x64', 'arm64'];
  for (const arch of arches) {
    const out = `release/mac/${arch}`;
    const archFlag = arch === 'x64' ? '--x64' : '--arm64';
    const args = ['-m', 'dmg', `-c.directories.output=${out}`, archFlag];
    runBuilder(args);
    trim(out);
    checksums(out);
  }
}
