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
exports.TCPEncrypt = void 0;
const crypto = __importStar(require("crypto"));
const TransportProtocol_1 = require("./TransportProtocol");
class TCPEncrypt {
    constructor(_hmacSecretKey, _cipher, _sequence = 0) {
        this._hmacSecretKey = _hmacSecretKey;
        this._cipher = _cipher;
        this._sequence = _sequence;
    }
    encryptAndHmac(args) {
        let dataLength = args.bodyLength + TransportProtocol_1.HMAC_LEN;
        const headBuffer = Buffer.allocUnsafe(TransportProtocol_1.ENCRYPT_TCP_HEADER_LENGTH);
        const hmac = crypto.createHmac(TransportProtocol_1.HASH_MODE, this._hmacSecretKey);
        let body = [];
        if (args.encrypt) {
            headBuffer.writeUInt16LE(1, TransportProtocol_1.ENCRYPT_TCP_ENCRYPT_POS);
            if (args.align16) {
                if (args.bodyLength % 16 !== 0) {
                    const bytes = 16 - args.bodyLength % 16;
                    dataLength = args.bodyLength + bytes + TransportProtocol_1.HMAC_LEN;
                    args.body.push(Buffer.allocUnsafe(bytes));
                }
            }
            for (const buf of args.body) {
                body.push(this._cipher.update(buf));
            }
        }
        else {
            headBuffer.writeUInt16LE(0, TransportProtocol_1.ENCRYPT_TCP_ENCRYPT_POS);
            body = args.body;
        }
        headBuffer.writeUInt16LE(TransportProtocol_1.ENCRYPT_TCP_HEADER_LENGTH, 0);
        headBuffer.writeUInt32LE(dataLength, TransportProtocol_1.ENCRYPT_TCP_DATA_LENGTH_POS);
        headBuffer.writeUInt32LE(this._sequence, TransportProtocol_1.ENCRYPT_TCP_SEQ_POS);
        this._sequence++;
        hmac.update(headBuffer);
        for (const buf of body) {
            hmac.update(buf);
        }
        return {
            'header': headBuffer,
            body,
            'hmac': hmac.digest()
        };
    }
}
exports.TCPEncrypt = TCPEncrypt;
//# sourceMappingURL=TCPEncrypt.js.map