import esbuild from 'esbuild'
import { copyFile, mkdir, rm, cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/*
 * Build script. Bundles each entry into a self-contained IIFE classic script
 * (no dynamic import), so content scripts run even on strict-CSP sites like
 * YouTube. Pass --watch to rebuild on change.
 */

const root = path.dirname(fileURLToPath(import.meta.url))
const watch = process.argv.includes('--watch')

const options = {
  entryPoints: {
    background: 'src/background/index.ts',
    content: 'src/content/index.ts',
    yt: 'src/platforms/youtube/index.ts',
    popup: 'src/popup/popup.ts',
  },
  bundle: true,
  format: 'iife',
  target: 'chrome111',
  outdir: 'dist',
  minify: !watch,
  sourcemap: watch,
  logLevel: 'info',
  alias: { '@': path.resolve(root, 'src') },
}

/* Static files Chrome loads directly. */
async function copyStatic() {
  await copyFile('manifest.json', 'dist/manifest.json')
  await copyFile('src/popup/index.html', 'dist/popup.html')
  await cp('icons', 'dist/icons', { recursive: true })
}

await rm('dist', { recursive: true, force: true })
await mkdir('dist', { recursive: true })

if (watch) {
  const ctx = await esbuild.context(options)
  await ctx.watch()
  await copyStatic()
  console.log('watching for changes...')
} else {
  await esbuild.build(options)
  await copyStatic()
}
