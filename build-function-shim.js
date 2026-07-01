// CJS shim for import.meta.url — injected at top of the bundle by esbuild
// This provides a __importMetaUrl variable that acts like import.meta.url in CJS
var __importMetaUrl = require('url').pathToFileURL(__filename).href;
