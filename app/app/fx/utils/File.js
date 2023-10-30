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
exports.execAt = exports.createWriteStream = exports.createReadStream = exports.getFileSize = exports.removeFiles = exports.mkdir = exports.scanFiles = exports.readDir = exports.readJsonFileSync = exports.readJsonFile = exports.writeTextFile = exports.readTextFile = exports.dirExists = exports.pathExists = exports.fileExists = exports.isExecutable = exports.isWritable = exports.isReadable = void 0;
const $FS = __importStar(require("fs"));
const $Path = __importStar(require("./Path"));
const E = __importStar(require("./Errors/Defs"));
const $ChildProcess = __importStar(require("child_process"));
async function isReadable(file) {
    try {
        await $FS.promises.access(file, $FS.constants.R_OK);
        return true;
    }
    catch {
        return false;
    }
}
exports.isReadable = isReadable;
async function isWritable(file) {
    try {
        if (await fileExists(file)) {
            await $FS.promises.access(file, $FS.constants.W_OK);
        }
        else {
            await $FS.promises.access($Path.extractParentPathInPath(file), $FS.constants.W_OK);
        }
        return true;
    }
    catch {
        return false;
    }
}
exports.isWritable = isWritable;
async function isExecutable(path) {
    try {
        await $FS.promises.access(path, $FS.constants.X_OK);
        return true;
    }
    catch {
        return false;
    }
}
exports.isExecutable = isExecutable;
async function fileExists(path) {
    try {
        return (await $FS.promises.stat(path)).isFile();
    }
    catch {
        return false;
    }
}
exports.fileExists = fileExists;
async function pathExists(path) {
    try {
        await $FS.promises.stat(path);
        return true;
    }
    catch {
        return false;
    }
}
exports.pathExists = pathExists;
async function dirExists(path) {
    try {
        return (await $FS.promises.stat(path)).isDirectory();
    }
    catch {
        return false;
    }
}
exports.dirExists = dirExists;
function readTextFile(path) {
    return $FS.promises.readFile(path, { encoding: 'utf-8' });
}
exports.readTextFile = readTextFile;
async function writeTextFile(path, content) {
    await $FS.promises.writeFile(path, content, { encoding: 'utf-8' });
}
exports.writeTextFile = writeTextFile;
async function readJsonFile(path, withComment = false) {
    try {
        const content = await readTextFile(path);
        if (withComment) {
            return (new Function(`return ${content.trim()}`))();
        }
        return JSON.parse(content);
    }
    catch (e) {
        throw new E.E_MALFORMED_JSON_FILE({}, e);
    }
}
exports.readJsonFile = readJsonFile;
function readJsonFileSync(path, withComment = false) {
    try {
        const content = $FS.readFileSync(path, { encoding: 'utf-8' });
        if (withComment) {
            return (new Function(`return ${content}`))();
        }
        return JSON.parse(content);
    }
    catch (e) {
        throw new E.E_MALFORMED_JSON_FILE({}, e);
    }
}
exports.readJsonFileSync = readJsonFileSync;
async function readDir(rootDir, concatRoot) {
    const ret = (await $FS.promises.readdir(rootDir));
    return concatRoot ? ret.map((v) => $Path.concatPath(rootDir, v)) : ret;
}
exports.readDir = readDir;
async function scanFiles(rootDir, filter = () => true) {
    const ret = [];
    for (const f of await readDir(rootDir, true)) {
        if (await dirExists(f)) {
            ret.push(...await scanFiles(f, filter));
        }
        else if (await fileExists(f) && filter(f)) {
            ret.push(f);
        }
    }
    return ret;
}
exports.scanFiles = scanFiles;
async function mkdir(path) {
    await $FS.promises.mkdir(path, { recursive: true });
}
exports.mkdir = mkdir;
async function removeFiles(files, opts) {
    if (!files.length) {
        return;
    }
    if (!opts?.useSystemCommand) {
        for (const f of files) {
            await $FS.promises.rm(f, { 'force': !!opts?.force, 'recursive': !!opts?.recursive });
        }
        return;
    }
    const flags = [];
    if (opts?.force) {
        flags.push('-f');
    }
    if (opts?.recursive) {
        flags.push('-r');
    }
    await execAt('rm', [...flags, ...files]);
}
exports.removeFiles = removeFiles;
async function getFileSize(path) {
    return (await $FS.promises.stat(path)).size;
}
exports.getFileSize = getFileSize;
exports.createReadStream = $FS.createReadStream;
exports.createWriteStream = $FS.createWriteStream;
const SHELL_WRAPPING_CHARS = /[^-~\w.]/;
async function execAt(cmd, args, cwd = process.cwd(), silent = false) {
    const prevCWD = process.cwd();
    if (cwd !== prevCWD) {
        process.chdir(cwd);
    }
    try {
        return await new Promise((resolve, reject) => {
            const finalCMD = [cmd, ...args]
                .map((v) => SHELL_WRAPPING_CHARS.test(v) ? `'${v.replace(/([\\'])/g, '\\$1')}'` : v)
                .join(' ');
            $ChildProcess.exec(finalCMD, (error, stdout, stderr) => {
                if (error) {
                    if (!silent) {
                        reject(error);
                    }
                    else {
                        resolve({ stdout, stderr, error: error.message, command: finalCMD });
                    }
                    return;
                }
                resolve({ stdout, stderr, error: '', command: finalCMD });
            });
        });
    }
    finally {
        if (cwd !== prevCWD) {
            process.chdir(prevCWD);
        }
    }
}
exports.execAt = execAt;
//# sourceMappingURL=File.js.map