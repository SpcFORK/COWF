"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = void 0;
const COWFParser_js_1 = require("./parser/COWFParser.js");
const errorHandler_js_1 = require("./utils/errorHandler.js");
const fileUtils_js_1 = require("./utils/fileUtils.js");
const ArtfParser_js_1 = require("./parser/Artf/ArtfParser.js");
/**
 * Runs the COWF CLI tool
 * @param filePath - The path to the COWF file
 * @param options - CLI options
 *
 * @param options.verbose - If true, enables verbose logging
 * @param options.results - If true, logs results of the COWF parser
 * @param options.language - The language to use for ARTF parsing
 * @param options.pretty - If true, pretty-prints the COWF AST
 * @param options.isGlobal - If true, enables global variables
 */
async function runCLI(filePath, options = {}) {
    try {
        const parser = new COWFParser_js_1.COWFParser();
        const chunkGenerator = (0, fileUtils_js_1.readFileInChunks)(filePath);
        const resultGenerator = parser.parseStream(chunkGenerator);
        let sectionCount = 0;
        let results = [];
        for await (const result of resultGenerator) {
            sectionCount++;
            if (options.verbose) {
                console.log(`Parsed section ${sectionCount}:`);
            }
            if (options.logResult) {
                console.log(result);
            }
            if (options.results) {
                results.push(JSON.stringify(result, null, options.pretty ? 2 : 0));
            }
            // Handle ARTF parsing with specified language
            if (result.format === "artf" && options.language) {
                const artfParser = new ArtfParser_js_1.ArtfParser();
                const artfResult = await artfParser.execute(result.content, options.language);
                console.log("ARTF Execution Result:", artfResult);
            }
        }
        if (options.verbose) {
            console.log(`Parsed ${sectionCount} sections.`);
        }
        if (options.results) {
            console.log(results);
        }
    }
    catch (error) {
        (0, errorHandler_js_1.handleError)(error);
    }
}
exports.runCLI = runCLI;
