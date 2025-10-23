# Troubleshooting

## Build errors
- TypeScript errors: run `npm run build` and review the first error; fix imports/typos
- Native module mismatch: run `npm run postinstall` to rebuild native deps

## Packaging issues
- Missing RPM: install `rpm` (`rpmbuild`), or skip RPM using Linux DEB only
- Windows NSIS on Linux: install `wine64` and `mono-complete`, or build on Windows

## App-specific
- ICO/ICNS generation: install `png2icons` or ImageMagick (`magick`/`convert`) for fallbacks
- ZIP packaging: ensure `zip` or `7z` exists on Linux/macOS; on Windows, PowerShell `Compress-Archive` is used

## Verification
- Check `release/<platform>/SHA256SUMS.txt`
- Run installers on target OS and verify launch + basic flows
