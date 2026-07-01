/**
 * Pre-bundles the Netlify Function as ESM using esbuild
 * This runs BEFORE netlify build to produce a properly bundled ESM output
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const outDir = join(__dirname, 'netlify-dist-functions');

// Clean output dir
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [join(__dirname, 'server/netlify-functions/api.js')],
  bundle: true,
  outfile: join(outDir, 'api.mjs'),
  platform: 'node',
  format: 'esm',
  target: 'node18',
  // Keep these as external — Lambda provides them or they need native bindings
  external: [
    'form-data',
    '@picovoice/*',
  ],
  // Handle import.meta correctly in ESM output
  define: {},
  banner: {
    // Polyfill __dirname and __filename for ESM in Lambda
    js: `
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirname_fn } from 'path';
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_fn(__filename);
`.trim()
  }
});

// Write a package.json to tell Node this is ESM
fs.writeFileSync(join(outDir, 'package.json'), JSON.stringify({ type: 'module' }));

console.log('✅ Function bundled to', outDir + '/api.mjs');
