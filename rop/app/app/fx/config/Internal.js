"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkNsTag = exports.NO_PATH = void 0;
exports.NO_PATH = Symbol('no-path');
function mkNsTag(ns) {
    return `config:${ns}`;
}
exports.mkNsTag = mkNsTag;
//# sourceMappingURL=Internal.js.map