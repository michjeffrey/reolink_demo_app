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
exports.createFakeEMail = exports.redactString = exports.redactIPv4Address = exports.redactIntegerId = exports.redactMobileNumber = exports.redactEMailAddress = exports.redactDomain = void 0;
const Crypto = __importStar(require("crypto"));
function redactDomain(domain) {
    const parts = domain.split('.');
    const tld = parts.pop();
    if (!tld) {
        throw new TypeError(`Invalid domain: ${domain}`);
    }
    const namePart = parts.join('.');
    switch (namePart.length) {
        case 0:
            throw new TypeError(`Invalid domain: ${domain}`);
        case 1:
            return `${namePart[0]}***${namePart[0]}.${tld}`;
        default:
            return `${namePart[0]}***${namePart[namePart.length - 1]}.${tld}`;
    }
}
exports.redactDomain = redactDomain;
function redactEMailAddress(addr) {
    const [prefix, suffix] = addr.split('@');
    switch (prefix.length) {
        case 0:
            throw new TypeError(`Invalid email address: ${addr}`);
        case 1:
            return `${prefix[0]}***${prefix[0]}@${redactDomain(suffix)}`;
        default:
            return `${prefix[0]}***${prefix[prefix.length - 1]}@${redactDomain(suffix)}`;
    }
}
exports.redactEMailAddress = redactEMailAddress;
function redactMobileNumber(fullNo) {
    return `******${fullNo.slice(-4).padStart(4, '0')}`;
}
exports.redactMobileNumber = redactMobileNumber;
function redactIntegerId(id) {
    id = id.toString();
    return `******${id.slice(-4).padStart(4, '0')}`;
}
exports.redactIntegerId = redactIntegerId;
function redactIPv4Address(ip) {
    return ip.slice(0, ip.lastIndexOf('.')) + '.*';
}
exports.redactIPv4Address = redactIPv4Address;
function redactString(s) {
    switch (s.length) {
        case 0:
        case 1:
        case 2:
        case 3:
            return '***';
        default:
            return `${s.slice(0, 2)}***${s.slice(-2)}`;
    }
}
exports.redactString = redactString;
function createFakeEMail(email, suffix = '@customer.reolink.com') {
    return Crypto.createHash('sha256').update(email.trim().toLowerCase()).digest().toString('hex') + suffix;
}
exports.createFakeEMail = createFakeEMail;
//# sourceMappingURL=Redaction.js.map