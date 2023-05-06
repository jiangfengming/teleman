import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",

  output: {
    format: "cjs",
    file: "dist/index.cjs",
    sourcemap: true,
    exports: "named",
  },

  plugins: [resolve(), commonjs(), typescript()],

  external: ["koa-compose"],
};
