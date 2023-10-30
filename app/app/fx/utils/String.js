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
exports.regexpEscape = exports.parseJSON = exports.replaceIllegalSpaceChars = exports.includeIllegalSpaceChars = exports.ILLEGAL_SPACE_REGEXP = exports.splitByLines = exports.toCapitalized = exports.trim = exports.htmlEscape = exports.groupString = exports.groupStringAsDigital = exports.toUpperCamelCase = exports.toLowerCamelCase = exports.toUpperSnakeCase = exports.toLowerSnakeCase = exports.ensureLowerCamelCase = exports.ensureUpperCamelCase = exports.isUpperCamelCase = exports.isLowerCamelCase = exports.isUpperSnakeCase = exports.isLowerSnakeCase = exports.convertToDOS = exports.convertToDarwin = exports.convertToUnix = exports.randomString = exports.DEFAULT_RANDOM_CHARSET = exports.RAND_CHARSET_HEX_L = exports.RAND_CHARSET_HEX_U = exports.RAND_CHARSET_AZ_UL = exports.RAND_CHARSET_AZ09_UL = exports.RAND_CHARSET_AZ09_L = exports.RAND_CHARSET_AZ09_U = exports.RAND_CHARSET_09 = exports.RAND_CHARSET_AZ_L = exports.RAND_CHARSET_AZ_U = void 0;
const E = __importStar(require("./Errors/Defs"));
const N = __importStar(require("./Number"));
exports.RAND_CHARSET_AZ_U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
exports.RAND_CHARSET_AZ_L = 'abcdefghijklmnopqrstuvwxyz';
exports.RAND_CHARSET_09 = '0123456789';
exports.RAND_CHARSET_AZ09_U = exports.RAND_CHARSET_AZ_U + exports.RAND_CHARSET_09;
exports.RAND_CHARSET_AZ09_L = exports.RAND_CHARSET_AZ_L + exports.RAND_CHARSET_09;
exports.RAND_CHARSET_AZ09_UL = exports.RAND_CHARSET_AZ_L + exports.RAND_CHARSET_AZ_U + exports.RAND_CHARSET_09;
exports.RAND_CHARSET_AZ_UL = exports.RAND_CHARSET_AZ_L + exports.RAND_CHARSET_AZ_U;
exports.RAND_CHARSET_HEX_U = exports.RAND_CHARSET_09 + 'ABCDEF';
exports.RAND_CHARSET_HEX_L = exports.RAND_CHARSET_09 + 'abcdef';
exports.DEFAULT_RANDOM_CHARSET = exports.RAND_CHARSET_AZ09_UL;
function randomString(length, charset = exports.DEFAULT_RANDOM_CHARSET) {
    const l = charset.length;
    let result = '';
    if (length <= 0) {
        return result;
    }
    while (length-- > 0) {
        result += charset[Math.floor(Math.random() * l)];
    }
    return result;
}
exports.randomString = randomString;
function convertToUnix(str) {
    return str.replace(/\r\n|\n|\r/g, '\n');
}
exports.convertToUnix = convertToUnix;
function convertToDarwin(str) {
    return str.replace(/\r\n|\n|\r/g, '\r');
}
exports.convertToDarwin = convertToDarwin;
function convertToDOS(str) {
    return str.replace(/\r\n|\n|\r/g, '\r\n');
}
exports.convertToDOS = convertToDOS;
function isLowerSnakeCase(id) {
    return /^[a-z]([_0-9a-z]+)*(?<!_)$/.test(id);
}
exports.isLowerSnakeCase = isLowerSnakeCase;
function isUpperSnakeCase(id) {
    return /^[A-Z]([_0-9A-Z]+)*(?<!_)$/.test(id);
}
exports.isUpperSnakeCase = isUpperSnakeCase;
function isLowerCamelCase(id) {
    return /^[a-z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(id);
}
exports.isLowerCamelCase = isLowerCamelCase;
function isUpperCamelCase(id) {
    return /^([A-Z]+[a-z0-9]*)*$/.test(id);
}
exports.isUpperCamelCase = isUpperCamelCase;
function ensureUpperCamelCase(input) {
    try {
        return toUpperCamelCase(input);
    }
    catch {
        return input
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .replace(/[a-z][A-Z]/g, (v) => v[0] + '_' + v[1])
            .replace(/_+/g, '_')
            .toLowerCase()
            .replace(/(_|^)[a-z0-9]/g, (v) => v[v.length - 1].toUpperCase());
    }
}
exports.ensureUpperCamelCase = ensureUpperCamelCase;
function ensureLowerCamelCase(input) {
    return toLowerCamelCase(ensureUpperCamelCase(input));
}
exports.ensureLowerCamelCase = ensureLowerCamelCase;
function toLowerSnakeCase(id) {
    if (isLowerSnakeCase(id)) {
        return id;
    }
    if (isUpperCamelCase(id) || isLowerCamelCase(id)) {
        return id
            .replace(/([A-Z][A-Z0-9]{1,}(?![a-z])|[A-Z][a-z0-9]*)/g, (v) => `_${v.toLowerCase()}`)
            .replace(/^_+/, '');
    }
    if (isUpperSnakeCase(id)) {
        return id.toLowerCase();
    }
    throw new E.E_CASE_STYLE_NOT_SUPPORT({ id });
}
exports.toLowerSnakeCase = toLowerSnakeCase;
function toUpperSnakeCase(id) {
    if (isUpperSnakeCase(id)) {
        return id;
    }
    if (isUpperCamelCase(id) || isLowerCamelCase(id)) {
        return id
            .replace(/(^[a-z0-9]+)|[A-Z][A-Z0-9]{1,}(?![a-z])|[A-Z][a-z0-9]*/g, (v) => `_${v.toUpperCase()}`)
            .replace(/^_+/, '');
    }
    if (isLowerSnakeCase(id)) {
        return id.toUpperCase();
    }
    throw new E.E_CASE_STYLE_NOT_SUPPORT({ id });
}
exports.toUpperSnakeCase = toUpperSnakeCase;
function toLowerCamelCase(id) {
    if (isLowerCamelCase(id)) {
        return id;
    }
    if (isLowerSnakeCase(id) || isUpperSnakeCase(id)) {
        return id.toLowerCase().replace(/_[a-z0-9]+/g, (v) => `${v[1].toUpperCase()}${v.slice(2)}`);
    }
    if (isUpperCamelCase(id)) {
        return id
            .replace(/^[A-Z]+(?:[A-Z][0-9a-z])/, (v) => `${v.slice(0, -2).toLowerCase()}${v.slice(-2)}`)
            .replace(/^[A-Z]+/, (v) => v.toLowerCase());
    }
    throw new E.E_CASE_STYLE_NOT_SUPPORT({ id });
}
exports.toLowerCamelCase = toLowerCamelCase;
function toUpperCamelCase(id) {
    if (isUpperCamelCase(id)) {
        return id;
    }
    if (isLowerSnakeCase(id) || isUpperSnakeCase(id)) {
        return `_${id.toLowerCase()}`.replace(/_[a-z0-9]+/g, (v) => `${v[1].toUpperCase()}${v.slice(2)}`);
    }
    if (isLowerCamelCase(id)) {
        return id.replace(/^[a-z]/, (v) => v.toUpperCase());
    }
    throw new E.E_CASE_STYLE_NOT_SUPPORT({ id });
}
exports.toUpperCamelCase = toUpperCamelCase;
function groupStringAsDigital(input, segWidth, delimiter) {
    const offset = input.length % segWidth;
    const re = new RegExp(`(.{${segWidth}})(?!$)`, 'g');
    if (offset > 0) {
        return `${input.slice(0, offset)}${delimiter}${input.slice(offset).replace(re, `$1${delimiter}`)}`;
    }
    return input.replace(re, `$1${delimiter}`);
}
exports.groupStringAsDigital = groupStringAsDigital;
function groupString(input, segWidth, delimiter) {
    return input.replace(new RegExp(`(.{${segWidth}})(?!$)`, 'g'), `$1${delimiter}`);
}
exports.groupString = groupString;
function htmlEscape(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
exports.htmlEscape = htmlEscape;
function trim(input) {
    return input.trim().replace(/[ \t]+/g, ' ');
}
exports.trim = trim;
function toCapitalized(str) {
    return str.replace(/^[a-z]/, (v) => v.toUpperCase());
}
exports.toCapitalized = toCapitalized;
function splitByLines(input) {
    return input.split(/\r\n|\r|\n/);
}
exports.splitByLines = splitByLines;
const ILLEGAL_SPACE_CHAR_CODES = [
    ...N.range(0x00, 0x09),
    0x000B,
    0x000C,
    ...N.range(0x0E, 0x1B),
    ...N.range(0x80, 0x9F),
    0x2407,
    0x237E,
    0x0200,
    0x200E,
    0x200F,
];
exports.ILLEGAL_SPACE_REGEXP = new RegExp(`[${ILLEGAL_SPACE_CHAR_CODES.map(c => `\\u${c.toString(16).padStart(4, '0')}`).join('')}]`, 'g');
function includeIllegalSpaceChars(v) {
    return exports.ILLEGAL_SPACE_REGEXP.test(v);
}
exports.includeIllegalSpaceChars = includeIllegalSpaceChars;
function replaceIllegalSpaceChars(src, dst = ' ') {
    return src.replace(exports.ILLEGAL_SPACE_REGEXP, dst);
}
exports.replaceIllegalSpaceChars = replaceIllegalSpaceChars;
function parseJSON(json, opts) {
    if (typeof json !== 'string') {
        throw new TypeError('JSON content to be parsed must be a string.');
    }
    if (opts.preprocess) {
        try {
            json = opts.preprocess(json);
            if (typeof json !== 'string') {
                throw new TypeError('JSON content to be parsed must be a string.');
            }
        }
        catch (e) {
            return opts.onError(e, json);
        }
    }
    let data;
    try {
        data = JSON.parse(json);
    }
    catch (e) {
        return opts.onError(e, json);
    }
    if (opts.postprocess) {
        try {
            return opts.postprocess(data);
        }
        catch (e) {
            return opts.onError(e, json);
        }
    }
    return data;
}
exports.parseJSON = parseJSON;
function regexpEscape(text) {
    return text.replace(/[.*+?^${}()|[\]/\\]/g, '\\$&');
}
exports.regexpEscape = regexpEscape;
//# sourceMappingURL=String.js.map