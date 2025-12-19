import fs from "fs";
import { transformSync } from "@babel/core";
import plugin from "./plugin";

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Usage: js-syntax-alias <file>");
  process.exit(1);
}

const code = fs.readFileSync(inputFile, "utf8");

const result = transformSync(code, {
  plugins: [plugin],
  filename: inputFile,
});

console.log(result?.code);