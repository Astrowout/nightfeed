// Shared code in src/data is also run by the Vercel API as native ES modules,
// which need explicit ".js" import paths. Metro resolves those to the .ts files.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const defaultResolve = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolve ?? context.resolveRequest;
  if (moduleName.startsWith('.') && moduleName.endsWith('.js')) {
    try {
      return resolve(context, moduleName.slice(0, -3), platform);
    } catch {
      // fall through to the normal lookup
    }
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
