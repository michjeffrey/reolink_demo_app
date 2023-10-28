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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreProtocol = exports.EncryptTCPProtocol = exports.ENCRYPT_MODE = exports.HASH_MODE = exports.HMAC_LEN = exports.DEFAULT_REPLAY_SEQ = exports.BAD_STATUS_CODE = exports.OK_STATUS_CODE = exports.CORE_EXTERN_LENGTH_POS = exports.CORE_RESPONSE_CODE_POS = exports.CORE_REQUEST_ID_POS = exports.CORE_DATA_LEN_SIZE = exports.CORE_DATA_LENGTH_POS = exports.CORE_COMMAND_POS = exports.CORE_HEADER_LENGTH = exports.ENCRYPT_TCP_SEQ_POS = exports.ENCRYPT_TCP_ENCRYPT_POS = exports.ENCRYPT_TCP_DATA_LEN_SIZE = exports.ENCRYPT_TCP_DATA_LENGTH_POS = exports.ENCRYPT_TCP_HEADER_LENGTH_POS = exports.ENCRYPT_TCP_HEADER_LENGTH = void 0;
const DI = __importStar(require("#fx/di"));
exports.ENCRYPT_TCP_HEADER_LENGTH = 12;
exports.ENCRYPT_TCP_HEADER_LENGTH_POS = 0;
exports.ENCRYPT_TCP_DATA_LENGTH_POS = 4;
exports.ENCRYPT_TCP_DATA_LEN_SIZE = 2;
exports.ENCRYPT_TCP_ENCRYPT_POS = 2;
exports.ENCRYPT_TCP_SEQ_POS = 8;
exports.CORE_HEADER_LENGTH = 24;
exports.CORE_COMMAND_POS = 4;
exports.CORE_DATA_LENGTH_POS = 8;
exports.CORE_DATA_LEN_SIZE = 4;
exports.CORE_REQUEST_ID_POS = 12;
exports.CORE_RESPONSE_CODE_POS = 16;
exports.CORE_EXTERN_LENGTH_POS = 20;
exports.OK_STATUS_CODE = 200;
exports.BAD_STATUS_CODE = 400;
exports.DEFAULT_REPLAY_SEQ = 0;
exports.HMAC_LEN = 32;
exports.HASH_MODE = 'sha256';
exports.ENCRYPT_MODE = 'aes-128-cfb';
let EncryptTCPProtocol = class EncryptTCPProtocol {
    parseHeader(header) {
        return {
            'bencrypted': header.readUInt16LE(exports.ENCRYPT_TCP_ENCRYPT_POS),
            'dataLength': header.readUInt32LE(exports.ENCRYPT_TCP_DATA_LENGTH_POS),
            'headerLength': header.readUInt16LE(exports.ENCRYPT_TCP_HEADER_LENGTH_POS),
            'sequence': header.readUInt32LE(exports.ENCRYPT_TCP_SEQ_POS),
        };
    }
};
EncryptTCPProtocol = __decorate([
    DI.Singleton()
], EncryptTCPProtocol);
exports.EncryptTCPProtocol = EncryptTCPProtocol;
let CoreProtocol = class CoreProtocol {
    parseHeader(header) {
        return {
            'magic': header.readUInt32LE(0),
            'cmd': header.readUInt32LE(exports.CORE_COMMAND_POS),
            'dataLength': header.readUInt32LE(exports.CORE_DATA_LENGTH_POS),
            'requestId': header.readUInt32LE(exports.CORE_REQUEST_ID_POS),
            'responseCode': header.readUInt32LE(exports.CORE_RESPONSE_CODE_POS),
            'externLength': header.readUInt32LE(exports.CORE_EXTERN_LENGTH_POS)
        };
    }
    parsePayload(header, body) {
        if (header.externLength === 0) {
            return {
                'payload': body
            };
        }
        else {
            const externLength = header.externLength;
            const ret = {
                payload: [],
                externXML: Buffer.allocUnsafe(externLength)
            };
            let externXMLPos = 0;
            for (let buf of body) {
                const copyLen = externLength - externXMLPos;
                if (buf.length < copyLen) {
                    buf.copy(ret.externXML, externXMLPos, 0, buf.length);
                    externXMLPos += buf.length;
                }
                else {
                    if (copyLen) {
                        buf.copy(ret.externXML, externXMLPos, 0, copyLen);
                        externXMLPos += copyLen;
                        buf = buf.subarray(copyLen);
                    }
                    if (buf.length) {
                        ret.payload.push(buf);
                    }
                }
            }
            return ret;
        }
    }
};
CoreProtocol = __decorate([
    DI.Singleton()
], CoreProtocol);
exports.CoreProtocol = CoreProtocol;
//# sourceMappingURL=TransportProtocol.js.map