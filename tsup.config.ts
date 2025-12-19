import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["cjs", "esm"],
  target: "es2020",
  dts: true,
  clean: true,

  external: [
    "@babel/core",
    "@babel/parser",
    "@babel/traverse",
    "@babel/types"
  ]
});
