const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const finalConfig = withNativewind(config);

const nativewindResolve = finalConfig.resolver.resolveRequest;

finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context.originModulePath || "";
  const fromAssetPackage =
    /node_modules[\\/](expo-asset|@react-native[\\/]assets-registry)[\\/]/.test(origin);

  if (moduleName === "react-native" && fromAssetPackage) {
    // default Metro resolution, skipping NativeWind's redirect
    return context.resolveRequest(context, moduleName, platform);
  }
  return (nativewindResolve || context.resolveRequest)(context, moduleName, platform);
};

module.exports = finalConfig;


// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativewind } = require("nativewind/metro");
 
// /** @type {import('expo/metro-config').MetroConfig} */
// const config = getDefaultConfig(__dirname);
 
// module.exports = withNativewind(config);