"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.createErrorNS = exports.COWS_errors = exports.COWS_types = exports.createInstruction = exports.COWSInstructionType = exports.COWS_instruction = exports.CowPrim = exports.CowSTD = exports.CowCore = exports.CowStatics = exports.COWS_static = exports.Lexer = exports.COWS_lex = exports.CowScope = exports.COWS_scope = exports.CowNode = exports.COWS_node = exports.CowSM = exports.COWS_sm = void 0;
exports.COWS_sm = __importStar(require("./COWS_sm"));
var COWS_sm_1 = require("./COWS_sm");
Object.defineProperty(exports, "CowSM", { enumerable: true, get: function () { return COWS_sm_1.CowSM; } });
exports.COWS_node = __importStar(require("./COWS_node"));
var COWS_node_1 = require("./COWS_node");
Object.defineProperty(exports, "CowNode", { enumerable: true, get: function () { return COWS_node_1.CowNode; } });
exports.COWS_scope = __importStar(require("./COWS_scope"));
var COWS_scope_1 = require("./COWS_scope");
Object.defineProperty(exports, "CowScope", { enumerable: true, get: function () { return COWS_scope_1.CowScope; } });
exports.COWS_lex = __importStar(require("./COWS_lex"));
var COWS_lex_1 = require("./COWS_lex");
Object.defineProperty(exports, "Lexer", { enumerable: true, get: function () { return COWS_lex_1.Lexer; } });
exports.COWS_static = __importStar(require("./COWS_static"));
var COWS_static_1 = require("./COWS_static");
Object.defineProperty(exports, "CowStatics", { enumerable: true, get: function () { return COWS_static_1.CowStatics; } });
Object.defineProperty(exports, "CowCore", { enumerable: true, get: function () { return COWS_static_1.CowCore; } });
Object.defineProperty(exports, "CowSTD", { enumerable: true, get: function () { return COWS_static_1.CowSTD; } });
Object.defineProperty(exports, "CowPrim", { enumerable: true, get: function () { return COWS_static_1.CowPrim; } });
exports.COWS_instruction = __importStar(require("./COWS_instruction"));
var COWS_instruction_1 = require("./COWS_instruction");
Object.defineProperty(exports, "COWSInstructionType", { enumerable: true, get: function () { return COWS_instruction_1.COWSInstructionType; } });
Object.defineProperty(exports, "createInstruction", { enumerable: true, get: function () { return COWS_instruction_1.createInstruction; } });
exports.COWS_types = __importStar(require("./COWS_types"));
exports.COWS_errors = __importStar(require("./COWS_errors"));
var COWS_errors_1 = require("./COWS_errors");
Object.defineProperty(exports, "createErrorNS", { enumerable: true, get: function () { return COWS_errors_1.createErrorNS; } });
Object.defineProperty(exports, "createError", { enumerable: true, get: function () { return COWS_errors_1.createError; } });
