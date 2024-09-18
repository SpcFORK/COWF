"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
function handleError(error) {
    console.error('An error occurred:');
    console.error(error.message);
    process.exit(1);
}
exports.handleError = handleError;
