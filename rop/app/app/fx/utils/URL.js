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
exports.createURL = exports.isHttpsUrl = exports.parseQueryString = exports.queryStringify = void 0;
const Types = __importStar(require("./Validation"));
function queryStringify(query) {
    return Object.entries(query)
        .map(([k, v]) => {
        if (Array.isArray(v)) {
            return v.map((i) => `${encodeURIComponent(k)}=${encodeURIComponent(i.toString())}`).join('&');
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(v.toString())}`;
    })
        .join('&');
}
exports.queryStringify = queryStringify;
function parseQueryString(query) {
    const ret = {};
    const arrayKeys = {};
    for (const i of query.split('&')) {
        if (!i.length) {
            continue;
        }
        const pos = i.indexOf('=');
        const key = decodeURIComponent(pos === -1 ? i : i.slice(0, pos));
        const value = pos === -1 ? '' : decodeURIComponent(i.slice(pos + 1));
        if (arrayKeys[key]) {
            ret[key].push(value);
        }
        else if (undefined === ret[key]) {
            ret[key] = value;
        }
        else {
            ret[key] = [ret[key], value];
            arrayKeys[key] = true;
        }
    }
    return ret;
}
exports.parseQueryString = parseQueryString;
function isHttpsUrl(input) {
    return typeof input === 'string' && input.startsWith('https://');
}
exports.isHttpsUrl = isHttpsUrl;
function createURL(opts) {
    if (!Types.isRawObject(opts)) {
        throw new TypeError('Invalid URL construction.');
    }
    if (!Types.isString(opts.protocol) || Types.isStringBlank(opts.protocol) || !/^[a-z0-9]+$/i.test(opts.protocol)) {
        throw new TypeError('Invalid URL protocol.');
    }
    if (!Types.isString(opts.host) || !/^[-.a-z0-9]+$/i.test(opts.host)) {
        throw new TypeError('Invalid URL hostname.');
    }
    const segs = [opts.protocol, '://'];
    if (Types.isString(opts.username) && Types.isStringNonBlank(opts.username) && Types.isString(opts.password)) {
        segs.push(encodeURIComponent(opts.username), ':', encodeURIComponent(opts.password), '@');
    }
    segs.push(opts.host.trim());
    if (Types.isNumber(opts.port) && Types.isInteger(opts.port)) {
        if (opts.port < 0 || opts.port > 65535) {
            throw new RangeError('Invalid URL port.');
        }
        segs.push(`:`, opts.port.toString());
    }
    if (Types.isString(opts.path) && Types.isStringNonBlank(opts.path)) {
        opts.path = opts.path.trim();
        if (opts.path.startsWith('/')) {
            segs.push(opts.path);
        }
        else {
            segs.push('/', opts.path);
        }
    }
    if (Types.isString(opts.search) && Types.isStringNonBlank(opts.search)) {
        segs.push(`?`, opts.search.trim());
    }
    else if (Types.isRawObject(opts.query)) {
        segs.push('?', queryStringify(opts.query));
    }
    if (Types.isString(opts.hash) && Types.isStringNonBlank(opts.hash)) {
        segs.push(`#`, opts.hash.trim());
    }
    return segs.join('');
}
exports.createURL = createURL;
//# sourceMappingURL=URL.js.map