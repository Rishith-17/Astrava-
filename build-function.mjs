/**
 * Pre-bundles the Netlify Function as a self-contained CJS bundle using esbuild.
 * 
 * This approach:
 * 1. Bundles all server/* code + node_modules into ONE file
 * 2. Outputs CJS (Netlify's native format — no wrapper issues)
 * 3. Replaces import.meta.url with a CJS path equivalent at build time
 * 4. The output is a single portable api.js that Netlify deploys cleanly
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'netlify-dist-functions');

if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const result = await build({
  entryPoints: [join(__dirname, 'server/netlify-functions/api.js')],
  bundle: true,
  outfile: join(outDir, 'api.js'),
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  // form-data uses native modules — keep external and rely on Lambda's node_modules
  external: [],
  metafile: true,
  // Substitute import.meta.url so it works in CJS context
  inject: [join(__dirname, 'build-function-shim.js')],
  define: {
    'import.meta.url': '__importMetaUrl'
  }
});

console.log('✅ Bundled successfully');
console.log('   Output:', outDir + '/api.js');
const stat = fs.statSync(join(outDir, 'api.js'));
console.log('   Size:', Math.round(stat.size / 1024) + ' KB');
