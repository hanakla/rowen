/** @type {import("@jest/types").Config.InitialOptions} */
module.exports = {
  transform: {
    ".+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        sourceMaps: true,
        module: {
          type: "commonjs",
        },

        jsc: {
          parser: {
            syntax: "typescript",
          },
        },
      },
    ],
  },
};
