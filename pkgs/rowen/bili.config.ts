import { Config } from "bili";
import typescript from "rollup-plugin-typescript2";

export default {
  input: ["src/index.ts", "src/cli.ts"],
  plugins: {
    typescript2: typescript(),
    terser: {
      mangle: {
        keep_classnames: true,
      },
      compress: false,

      // {
      //   arrows: true,
      //   arguments: true,
      //   ecma: 2015,
      // },
      output: {
        beautify: true,
      },
    },
  },
  babel: { asyncToPromises: false },
  bundleNodeModules: ["tslib"],
  output: {
    format: ["cjs", "esm"],
  },
} as Config;
