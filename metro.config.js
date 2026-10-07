// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * expo-sqlite on web is backed by SQLite compiled to WebAssembly, which needs two
 * things from Metro that it does not enable by default:
 *
 *  1. `.wasm` must be treated as an asset rather than a source module.
 *  2. `SharedArrayBuffer` must be allowed, which the browser only grants to
 *     cross-origin isolated documents. That in turn requires the COEP/COOP
 *     headers exported below — `npx expo export --platform web` writes
 *     `index.html` with them, but a static host must send them too.
 *
 * This only affects the web target. Android and iOS use the native SQLite build,
 * so the phone app runs in Expo Go without any of this.
 */
config.resolver.assetExts.push('wasm');

config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return middleware(req, res, next);
};

module.exports = config;