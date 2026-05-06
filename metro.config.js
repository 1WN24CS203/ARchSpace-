// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow .glb and .gltf 3D model files to be picked from the device
// (they are not bundled — just referenced by URI — but adding the extensions
//  prevents Metro from erroring if a static require is ever used)
config.resolver.assetExts.push('glb', 'gltf', 'bin');

module.exports = config;
