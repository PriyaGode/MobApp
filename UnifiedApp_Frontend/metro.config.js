const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for @/ path alias
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, '.'),
};

module.exports = config;
