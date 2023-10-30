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
exports.isEMailAddress = exports.isDomain = exports.fromIPv4IntAddress = exports.fromIPv4UIntAddress = exports.toIPv4UIntAddress = exports.toIPv4IntAddress = exports.isIPv4UIntAddress = exports.isIPv4IntAddress = exports.isIPv4Address = exports.download = exports.tcpTry = void 0;
const $Net = __importStar(require("net"));
const File = __importStar(require("./File"));
const E = __importStar(require("./Errors/Defs"));
const Types = __importStar(require("./Validation"));
const DOMAIN_REGEXP = /^[a-z0-9][-a-z0-9]{0,62}(\.[a-z0-9][-a-z0-9]{0,62})*\.[a-z]{2,26}$/i;
const DOMAIN_MIN_LENGTH = 1;
const DOMAIN_MAX_LENGTH = 255;
const EMAIL_REGEXP = /^[-+_a-z0-9][-+_.a-z0-9]{0,62}@[a-z0-9][-a-z0-9]{0,62}(\.[a-z0-9][-a-z0-9]{0,62})*\.[a-z]{2,26}$/i;
const EMAIL_MAX_LENGTH = 255;
const EMAIL_MIN_LENGTH = 6;
function tcpTry(hostname, port, timeout) {
    return new Promise((resolve) => {
        const socket = $Net.connect(port, hostname).setTimeout(timeout);
        socket.on('error', () => {
            resolve(false);
        }).on('timeout', () => {
            socket.destroy(new Error('timeout'));
        }).on('connect', () => {
            resolve(true);
            socket.end();
        }).on('close', (e) => {
            resolve(!e);
        });
    });
}
exports.tcpTry = tcpTry;
async function download(hCli, opts, file, failedContentLength = 0, autoClean = false) {
    if (!await File.isWritable(file)) {
        throw new E.E_FILE_INACCESSIBLE({ file });
    }
    const req = await hCli.request(opts);
    if (req.statusCode === 200) {
        try {
            await new Promise((resolve, reject) => {
                req.getStream()
                    .once('error', reject)
                    .pipe(File.createWriteStream(file))
                    .once('error', reject)
                    .once('finish', resolve);
            });
        }
        catch (e) {
            if (autoClean && await File.fileExists(file)) {
                await File.removeFiles([file]);
            }
            throw new E.E_HTTP_FAILED({
                status: req.statusCode,
                headers: req.headers,
            }, e);
        }
        return req.headers;
    }
    let failedContent = null;
    if (failedContentLength > 0) {
        failedContent = await req.getBuffer(failedContentLength);
    }
    else {
        req.abort();
    }
    throw new E.E_HTTP_FAILED({
        status: req.statusCode,
        headers: req.headers,
        content: failedContent,
    });
}
exports.download = download;
function isIPv4Address(input) {
    return Types.isString(input)
        && /^\d{1,3}(\.\d{1,3}){3}$/.test(input)
        && input.split('.').map((v) => parseInt(v)).every(x => x >= 0 && x <= 255);
}
exports.isIPv4Address = isIPv4Address;
function isIPv4IntAddress(input) {
    return Types.isNumber(input) && Types.isInteger(input) && input >= -0x80000000 && input <= 0x7FFFFFFF;
}
exports.isIPv4IntAddress = isIPv4IntAddress;
function isIPv4UIntAddress(input) {
    return Types.isNumber(input) && Types.isInteger(input) && input >= 0 && input <= 0xFFFFFFFF;
}
exports.isIPv4UIntAddress = isIPv4UIntAddress;
function toIPv4IntAddress(input) {
    if (!isIPv4Address(input)) {
        throw new TypeError(`Invalid IPv4 string address`);
    }
    return input.split('.').map((v) => parseInt(v)).reduce((acc, v) => acc << 8 | v, 0);
}
exports.toIPv4IntAddress = toIPv4IntAddress;
function toIPv4UIntAddress(input) {
    return toIPv4IntAddress(input) >>> 0;
}
exports.toIPv4UIntAddress = toIPv4UIntAddress;
function fromIPv4UIntAddress(input) {
    if (!isIPv4UIntAddress(input)) {
        throw new TypeError(`Invalid IPv4 unsigned integer address`);
    }
    return [
        input >>> 24,
        (input >>> 16) & 0xFF,
        (input >>> 8) & 0xFF,
        input & 0xFF,
    ].join('.');
}
exports.fromIPv4UIntAddress = fromIPv4UIntAddress;
function fromIPv4IntAddress(input) {
    if (!isIPv4IntAddress(input)) {
        throw new TypeError(`Invalid IPv4 unsigned integer address`);
    }
    return [
        input >>> 24,
        (input >>> 16) & 0xFF,
        (input >>> 8) & 0xFF,
        input & 0xFF,
    ].join('.');
}
exports.fromIPv4IntAddress = fromIPv4IntAddress;
function isDomain(domain) {
    return domain.length >= DOMAIN_MIN_LENGTH &&
        domain.length < DOMAIN_MAX_LENGTH &&
        DOMAIN_REGEXP.test(domain);
}
exports.isDomain = isDomain;
function isEMailAddress(email) {
    return email.length >= EMAIL_MIN_LENGTH &&
        email.length < EMAIL_MAX_LENGTH &&
        !email.includes('..') &&
        !email.includes('.@') &&
        EMAIL_REGEXP.test(email);
}
exports.isEMailAddress = isEMailAddress;
//# sourceMappingURL=Network.js.map