const { withSettingsGradle, withAppBuildGradle, withProjectBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to integrate Unity-as-a-Library (@azesmway/react-native-unity)
 */
const withUnityAndroid = (config) => {
  // 1. Modify settings.gradle
  config = withSettingsGradle(config, (config) => {
    const unitySettings = `
include ':unityLibrary'
project(':unityLibrary').projectDir = new File(rootProject.projectDir, '../unity/builds/android/unityLibrary')
`;
    if (!config.modResults.contents.includes(":unityLibrary")) {
      config.modResults.contents += unitySettings;
    }
    return config;
  });

  // 2. Modify app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    const unityDependency = "    implementation project(':unityLibrary')\n    implementation fileTree(dir: 'libs', include: ['*.jar'])";
    if (!config.modResults.contents.includes("project(':unityLibrary')")) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s?\{/,
        `dependencies {\n${unityDependency}`
      );
    }
    return config;
  });

  // 3. Modify root build.gradle
  config = withProjectBuildGradle(config, (config) => {
    const flatDirRepo = `
        flatDir {
            dirs "\${project(':unityLibrary').projectDir}/libs"
        }
`;
    if (!config.modResults.contents.includes("flatDir")) {
      config.modResults.contents = config.modResults.contents.replace(
        /allprojects\s?\{\s?repositories\s?\{/,
        `allprojects {\n    repositories {\n${flatDirRepo}`
      );
    }
    return config;
  });

  // 4. Cleanup Unity AndroidManifest.xml (remove intent-filter to prevent double icons)
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const manifestPath = path.join(
        config.modRequest.projectRoot,
        'unity/builds/android/unityLibrary/src/main/AndroidManifest.xml'
      );
      if (fs.existsSync(manifestPath)) {
        let content = fs.readFileSync(manifestPath, 'utf8');
        content = content.replace(/<intent-filter>[\s\S]*?<\/intent-filter>/g, '');
        fs.writeFileSync(manifestPath, content);
      }
      return config;
    },
  ]);

  return config;
};

module.exports = withUnityAndroid;

