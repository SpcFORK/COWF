"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.tokens = [];
        this.currentChar = this.input[this.position] || null;
    }
    // Move to the next character
    advance() {
        this.position += 1;
        if (this.position < this.input.length) {
            this.currentChar = this.input[this.position];
        }
        else {
            this.currentChar = null;
        }
    }
    // Skip whitespace
    skipWhitespace() {
        while (this.currentChar && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }
    // Check if the current char is a digit
    isDigit(char) {
        return /\d/.test(char);
    }
    // Check if the current char is a letter
    isLetter(char) {
        return /[a-zA-Z]/.test(char);
    }
    createToken(type, value) {
        return { type, value };
    }
    // Handle numbers (both integers and floats)
    getNumber() {
        let numStr = "";
        while (this.currentChar && this.isDigit(this.currentChar)) {
            numStr += this.currentChar;
            this.advance();
        }
        // Handle decimal point for floats
        if (this.currentChar === ".") {
            numStr += ".";
            this.advance();
            while (this.currentChar && this.isDigit(this.currentChar)) {
                numStr += this.currentChar;
                this.advance();
            }
        }
        return this.createToken("NUMBER", parseFloat(numStr));
    }
    // Handle identifiers (keywords or variable names)
    getIdentifier() {
        let idStr = "";
        while (this.currentChar &&
            (this.isLetter(this.currentChar) || this.isDigit(this.currentChar))) {
            idStr += this.currentChar;
            this.advance();
        }
        // Check if it's a keyword (like ASG, TAP, etc.)
        if (this.isKeyword(idStr)) {
            return this.createToken("KEYWORD", idStr);
        }
        return this.createToken("IDENTIFIER", idStr);
    }
    isKeyword(str) {
        const keywords = [
            "ASG",
            "TAP",
            "PUT",
            "REC",
            "CLR",
            "UBCK",
            "PRT",
            "PRB",
            "SWP",
            "JMP",
            "THEN",
            "DOJ",
            "ADD",
            "SUB",
            "PUSH",
            "MUL",
            "DIV",
            "MOV",
            "CMP",
            "JNE",
            "AND",
            "OR",
            "XOR",
            "SHL",
            "SHR",
            "RET",
            "POP",
            "INC",
            "DEC",
            "NEG",
        ];
        return keywords.includes(str);
    }
    // Tokenize the input
    tokenize() {
        while (this.currentChar !== null) {
            this.skipWhitespace();
            if (this.isLetter(this.currentChar)) {
                this.tokens.push(this.getIdentifier());
            }
            else if (this.isDigit(this.currentChar)) {
                this.tokens.push(this.getNumber());
            }
            else if (this.currentChar === "=") {
                this.tokens.push(this.createToken("ASSIGN", "="));
                this.advance();
            }
            else if (this.currentChar === "+") {
                this.tokens.push(this.createToken("PLUS", "+"));
                this.advance();
            }
            else if (this.currentChar === "-") {
                this.tokens.push(this.createToken("MINUS", "-"));
                this.advance();
            }
            else if (this.currentChar === "*") {
                this.tokens.push(this.createToken("MUL", "*"));
                this.advance();
            }
            else if (this.currentChar === "/") {
                this.tokens.push(this.createToken("DIVIDE", "/"));
                this.advance();
            }
            else {
                // Unrecognized character
                throw new Error(`Unknown character: ${this.currentChar}`);
            }
        }
        return this.tokens;
    }
}
exports.Lexer = Lexer;
// // Example usage:
// const inputCode = `ASG x = 5
// ADD x 3
// PRT x`;
// const lexer = new Lexer(inputCode);
// const tokens = lexer.tokenize();
// console.log(tokens);
