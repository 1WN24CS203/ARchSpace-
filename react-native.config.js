const fs = require('fs');
const path = require('path');

const unityLibraryPath = path.join(__dirname, 'unity', 'builds', 'android', 'unityLibrary');
const hasUnityExport = fs.existsSync(unityLibraryPath);

module.exports = {
  dependencies: {
    '@azesmway/react-native-unity': {
      // Only autolink Unity native module when a Unity-as-a-Library export exists.
      // This prevents Android builds from failing when the Unity export folder is missing.
      platforms: hasUnityExport ? undefined : { android: null, ios: null },
    },
  },
};
