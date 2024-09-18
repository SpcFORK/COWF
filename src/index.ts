#!/usr/bin/env node

// const { runCLI } = require("./cli");
import { runCLI } from "./cli.js";

function hasFlag(small: string, big: string) {
  return (
    process.argv.includes("--" + big) || process.argv.includes("-" + small)
  );
}

async function main() {
  const filePath = process.argv[2];

  const verbose = hasFlag("v", "verbose");
  const results = hasFlag("r", "results");
  const pretty = hasFlag("p", "pretty");
  const logResult = hasFlag("l", "log");
  const isGlobal = hasFlag("g", "global");

  const language = process.argv
    .find((arg) => arg.startsWith("--lang="))
    ?.split("=")[1];

  if (!filePath) {
    console.error("Please provide a file path as an argument.");
    process.exit(1);
  }

  await runCLI(filePath, {
    verbose,
    logResult,
    results,
    language,
    pretty,
    isGlobal,
  });
}

main();
