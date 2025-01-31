const { getDefaultConfig } = require('@expo/metro-config');

// Get the default Metro configuration for Expo
const defaultConfig = getDefaultConfig(__dirname);

// Add 'cjs' to the list of supported extensions
defaultConfig.resolver.sourceExts.push('cjs');

// Export the configuration
module.exports = defaultConfig;
