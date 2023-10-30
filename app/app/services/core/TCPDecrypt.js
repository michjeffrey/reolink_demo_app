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
exports.TCPDecrypt = void 0;
const crypto = __importStar(require("crypto"));
const device_1 = require("../../errors/device");
const TransportProtocol_1 = require("./TransportProtocol");
class TCPDecrypt {
    constructor(_hmacSecretKey, _cipher) {
        this._hmacSecretKey = _hmacSecretKey;
        this._cipher = _cipher;
        this._encryptTCPProtocol = new TransportProtocol_1.EncryptTCPProtocol();
    }
    checkAndDecrypt(item, assertSignature = false) {
        if (assertSignature && !this._assertSignatureMatched(item)) {
            throw new device_1.E_SIGNATURE_NOT_MATCHED();
        }
        const header = this._encryptTCPProtocol.parseHeader(item.header);
        let bodyLength = header.dataLength - TransportProtocol_1.HMAC_LEN;
        const body = [];
        for (const buf of item.payload) {
            if (!buf.length || !bodyLength) {
                continue;
            }
            if (buf.length < bodyLength) {
                if (header.bencrypted) {
                    body.push(this._cipher.update(buf));
                }
                else {
                    body.push(buf);
                }
                bodyLength -= buf.length;
            }
            else {
                if (header.bencrypted) {
                    body.push(this._cipher.update(buf.subarray(0, bodyLength)));
                }
                else {
                    body.push(buf.subarray(0, bodyLength));
                }
                bodyLength = 0;
                break;
            }
        }
        return body;
    }
    _assertSignatureMatched(item) {
        const header = this._encryptTCPProtocol.parseHeader(item.header);
        let bodyLength = header.dataLength - TransportProtocol_1.HMAC_LEN;
        const hmac = crypto.createHmac(TransportProtocol_1.HASH_MODE, this._hmacSecretKey);
        hmac.update(item.header);
        const signature = Buffer.allocUnsafe(TransportProtocol_1.HMAC_LEN);
        let signatureLen = 0;
        for (let buf of item.payload) {
            if (!buf.length) {
                continue;
            }
            if (buf.length < bodyLength) {
                hmac.update(buf);
                bodyLength -= buf.length;
            }
            else {
                if (bodyLength > 0) {
                    hmac.update(buf.subarray(0, bodyLength));
                    buf = buf.subarray(bodyLength);
                    bodyLength = 0;
                }
                const copyLen = TransportProtocol_1.HMAC_LEN - signatureLen;
                if (copyLen <= 0) {
                    break;
                }
                else {
                    if (copyLen > buf.length) {
                        buf.copy(signature, signatureLen, 0, buf.length);
                        signatureLen += buf.length;
                    }
                    else {
                        buf.copy(signature, signatureLen, 0, copyLen);
                        break;
                    }
                }
            }
        }
        const matched = hmac.digest().equals(signature);
        if (!matched) {
            return false;
        }
        return true;
    }
}
exports.TCPDecrypt = TCPDecrypt;
//# sourceMappingURL=TCPDecrypt.js.map