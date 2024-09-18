#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const { runCLI } = require("./cli");
const cli_js_1 = require("./cli.js");
function hasFlag(small, big) {
    return (process.argv.includes("--" + big) || process.argv.includes("-" + small));
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
    await (0, cli_js_1.runCLI)(filePath, {
        verbose,
        logResult,
        results,
        language,
        pretty,
        isGlobal,
    });
}
main();
