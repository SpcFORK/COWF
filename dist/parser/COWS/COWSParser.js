"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COWSParser = void 0;
const COWS_lex_1 = require("./COWS_lex");
const COWS_errors_1 = require("./COWS_errors");
class COWSParser {
    constructor() { }
    parse(content) {
        const tokens = new COWS_lex_1.Lexer(content).tokenize();
        return this.buildAST(tokens);
    }
    buildAST(tokens) {
        let currentTokenIndex = 0;
        const rootNode = this.createRoot();
        while (currentTokenIndex < tokens.length) {
            const token = tokens[currentTokenIndex];
            switch (token.type) {
                case "INSTRUCTION":
                    rootNode.children?.push(this.parseInstruction(tokens, currentTokenIndex));
                    currentTokenIndex++;
                    break;
                // Add more cases here for different token types
                default:
                    throw new COWS_errors_1.CowError(`Unexpected token type: ${token.type}`);
            }
        }
        return rootNode;
    }
    createRoot() {
        return {
            type: "Program",
            value: [],
            children: [],
        };
    }
    parseInstruction(tokens, currentIndex) {
        const token = tokens[currentIndex];
        return {
            type: "Instruction",
            value: token.value,
        };
    }
}
exports.COWSParser = COWSParser;
