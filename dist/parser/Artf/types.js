"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreBlocks = exports.StackType = void 0;
var StackType;
(function (StackType) {
    StackType[StackType["subroutine"] = 0] = "subroutine";
    StackType[StackType["asyncSubroutine"] = 1] = "asyncSubroutine";
    StackType[StackType["thread"] = 2] = "thread";
    StackType[StackType["assignment"] = 3] = "assignment";
    StackType[StackType["variable"] = 4] = "variable";
    StackType[StackType["operation"] = 5] = "operation";
    StackType[StackType["return"] = 6] = "return";
    StackType[StackType["code_block"] = 7] = "code_block";
    StackType[StackType["general"] = 8] = "general";
})(StackType = exports.StackType || (exports.StackType = {}));
var CoreBlocks;
(function (CoreBlocks) {
    CoreBlocks[CoreBlocks["anon"] = 0] = "anon";
    CoreBlocks[CoreBlocks["Assignment"] = 1] = "Assignment";
    CoreBlocks[CoreBlocks["ExecAssig"] = 2] = "ExecAssig";
    CoreBlocks[CoreBlocks["ExecGOp"] = 3] = "ExecGOp";
})(CoreBlocks = exports.CoreBlocks || (exports.CoreBlocks = {}));
