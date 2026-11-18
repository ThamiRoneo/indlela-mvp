import expo from "eslint-config-expo/flat.js";

export default [
  ...expo,
  // expo-splash-screen plugin build files are plain CJS; keep them out of lint.
  {
    ignores: ["node_modules/**"],
  },
];
