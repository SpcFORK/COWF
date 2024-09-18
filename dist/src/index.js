#!/usr/bin/env node
import { runCLI } from "./cli.js";
function hasFlag(small, big) {
    return (process.argv.includes("--" + big) || process.argv.includes("-" + small));
}
async function main() {
    var _a;
    const filePath = process.argv[2];
    const verbose = hasFlag("v", "verbose");
    const results = hasFlag("r", "results");
    const logResult = hasFlag("l", "log");
    const language = (_a = process.argv.find(arg => arg.startsWith("--lang="))) === null || _a === void 0 ? void 0 : _a.split("=")[1];
    if (!filePath) {
        console.error("Please provide a file path as an argument.");
        process.exit(1);
    }
    await runCLI(filePath, { verbose, logResult, results, language });
}
main();
