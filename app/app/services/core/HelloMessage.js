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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloMessage = exports.HELLO_MESSAGE_LENGTH = void 0;
const DI = __importStar(require("#fx/di"));
const crypto = __importStar(require("crypto"));
const DeviceKeyManager_1 = require("../dal/DeviceKeyManager");
const U = __importStar(require("#fx/utils"));
const Logs = __importStar(require("#fx/log"));
const TransportProtocol_1 = require("./TransportProtocol");
const device_1 = require("../../errors/device");
exports.HELLO_MESSAGE_LENGTH = 100;
let HelloMessage = class HelloMessage {
    _parseHeader(header) {
        return {
            'helloLength': header.readUInt16LE(0),
            'rspCode': header.readUInt16LE(2),
            'accessKey': header.subarray(4, 36),
            'clientNonce': header.subarray(36, 68),
            'signature': header.subarray(68, 100)
        };
    }
    handleHelloMessage(socket, buf) {
        const header = this._parseHeader(buf);
        const secretAccessKey = this._deviceKeyMngr.retriveSecretAccessKey(header.accessKey.toString());
        const signature = crypto.createHmac(TransportProtocol_1.HASH_MODE, secretAccessKey).update(buf.subarray(0, 68)).digest();
        if (!(signature.equals(header.signature))) {
            this._logs.error({
                'action': 'handleHelloMessage',
                'message': 'signature not matched',
                'data': {
                    signature,
                    'clientSignature': header.signature
                }
            });
            throw new device_1.E_SIGNATURE_NOT_MATCHED({
                'action': 'handleHelloMessage'
            });
        }
        const serverNonce = Buffer.from(U.String.randomString(32));
        const buffer = Buffer.allocUnsafe(exports.HELLO_MESSAGE_LENGTH);
        buf.copy(buffer, 0, 0, 36);
        buffer.writeInt16LE(exports.HELLO_MESSAGE_LENGTH, 0);
        const accessKeyValid = this._deviceKeyMngr.checkIfAccessKeyValid(header.accessKey.toString());
        if (!accessKeyValid) {
            buffer.writeInt16LE(TransportProtocol_1.BAD_STATUS_CODE, 2);
        }
        else {
            buffer.writeInt16LE(TransportProtocol_1.OK_STATUS_CODE, 2);
        }
        serverNonce.copy(buffer, 36, 0, 32);
        const serverSignature = crypto.createHmac(TransportProtocol_1.HASH_MODE, secretAccessKey).update(buffer.subarray(0, 68)).digest();
        serverSignature.copy(buffer, 68, 0, 32);
        socket.write(buffer);
        if (!accessKeyValid) {
            this._logs.error({
                'action': 'handleHelloMessage',
                'message': 'accessKey expired',
                'data': {
                    'accessKey': header.accessKey.toString()
                }
            });
            throw new device_1.E_ACCESS_KEY_NOT_VALID();
        }
        const encryptKey = crypto
            .createHmac(TransportProtocol_1.HASH_MODE, secretAccessKey)
            .update(Buffer.concat([header.clientNonce, serverNonce]))
            .digest();
        return {
            encryptKey,
            secretAccessKey
        };
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceKeyManager_1.DeviceKeyManager)
], HelloMessage.prototype, "_deviceKeyMngr", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], HelloMessage.prototype, "_logs", void 0);
HelloMessage = __decorate([
    DI.Singleton()
], HelloMessage);
exports.HelloMessage = HelloMessage;
//# sourceMappingURL=HelloMessage.js.map