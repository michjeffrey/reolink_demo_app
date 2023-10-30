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
exports.isValidFileName = exports.concatPath = exports.toAbsolutePath = exports.extractFileNameInPath = exports.extractExtNameInPath = exports.ensureRelativePath = exports.extractParentPathInPath = exports.getRelativePath = exports.setCurrentWorkDirectory = exports.getCurrentWorkDirectory = void 0;
const $Path = __importStar(require("path"));
function getCurrentWorkDirectory() {
    return process.cwd();
}
exports.getCurrentWorkDirectory = getCurrentWorkDirectory;
function setCurrentWorkDirectory(newCWD) {
    const oldCWD = getCurrentWorkDirectory();
    process.chdir(newCWD);
    return oldCWD;
}
exports.setCurrentWorkDirectory = setCurrentWorkDirectory;
function getRelativePath(referPath, targetPath) {
    return ensureRelativePath($Path.relative(referPath, targetPath));
}
exports.getRelativePath = getRelativePath;
function extractParentPathInPath(path) {
    return ensureRelativePath($Path.dirname(path));
}
exports.extractParentPathInPath = extractParentPathInPath;
function ensureRelativePath(path) {
    return path.replace(/^(?!\.{0,2}\/)/, './');
}
exports.ensureRelativePath = ensureRelativePath;
function extractExtNameInPath(path) {
    return $Path.extname(path);
}
exports.extractExtNameInPath = extractExtNameInPath;
function extractFileNameInPath(path) {
    return $Path.basename(path);
}
exports.extractFileNameInPath = extractFileNameInPath;
function toAbsolutePath(relPath) {
    return $Path.resolve(relPath);
}
exports.toAbsolutePath = toAbsolutePath;
function concatPath(...paths) {
    return ensureRelativePath($Path.join(...paths));
}
exports.concatPath = concatPath;
const WIN32_RESERVED_NAMES = [
    'con', 'prn', 'aux', 'nul',
    'com1', 'com2', 'com3', 'com4',
    'com5', 'com6', 'com7', 'com8',
    'com9', 'lpt1', 'lpt2', 'lpt3',
    'lpt4', 'lpt5', 'lpt6', 'lpt7',
    'lpt8', 'lpt9', '.', '..', '~'
];
function isValidFileName(name) {
    return (name.length > 0 && name.length <= 0xFF)
        && !/["'\\/:;<>|*?\x00-\x1F]/.test(name)
        && !WIN32_RESERVED_NAMES.includes(name.toLowerCase());
}
exports.isValidFileName = isValidFileName;
//# sourceMappingURL=Path.js.map