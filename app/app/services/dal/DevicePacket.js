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
exports.DeviceEncryptPacket = exports.DevicePlainPacket = void 0;
const DI = __importStar(require("#fx/di"));
const Logs = __importStar(require("#fx/log"));
const TransportProtocol_1 = require("../core/TransportProtocol");
let DevicePlainPacket = class DevicePlainPacket {
    constructPacket(args) {
        let payload = '';
        const header = Buffer.allocUnsafe(TransportProtocol_1.CORE_HEADER_LENGTH);
        let magic = 0;
        if (args.type === 'response') {
            magic = 1;
        }
        header.writeUInt32LE(magic, 0);
        header.writeUInt32LE(args.cmd, TransportProtocol_1.CORE_COMMAND_POS);
        if (args.externXML) {
            header.writeUInt32LE(Buffer.byteLength(args.externXML), TransportProtocol_1.CORE_EXTERN_LENGTH_POS);
            payload = args.externXML;
        }
        else {
            header.writeUInt32LE(0, TransportProtocol_1.CORE_EXTERN_LENGTH_POS);
        }
        if (args.data) {
            if (payload.length) {
                payload = Buffer.concat([Buffer.from(payload), Buffer.from(args.data)]);
            }
            else {
                payload = args.data;
            }
        }
        header.writeUInt32LE(Buffer.byteLength(payload), TransportProtocol_1.CORE_DATA_LENGTH_POS);
        header.writeUInt32LE(args.requestId, TransportProtocol_1.CORE_REQUEST_ID_POS);
        header.writeUInt32LE(args.responseCode, TransportProtocol_1.CORE_RESPONSE_CODE_POS);
        return {
            header,
            payload
        };
    }
};
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], DevicePlainPacket.prototype, "_logs", void 0);
DevicePlainPacket = __decorate([
    DI.Singleton()
], DevicePlainPacket);
exports.DevicePlainPacket = DevicePlainPacket;
let DeviceEncryptPacket = class DeviceEncryptPacket {
    constructEncryptPacket(args) {
        const packet = this._devicePacket.constructPacket(args);
        const body = [];
        const header = Buffer.alloc(TransportProtocol_1.ENCRYPT_TCP_HEADER_LENGTH);
        header.writeUInt16LE(TransportProtocol_1.ENCRYPT_TCP_HEADER_LENGTH, TransportProtocol_1.ENCRYPT_TCP_HEADER_LENGTH_POS);
        const dataLength = packet.header.length + packet.payload.length + TransportProtocol_1.HMAC_LEN;
        header.writeUInt16LE(dataLength, TransportProtocol_1.ENCRYPT_TCP_DATA_LENGTH_POS);
        if (args.cipher) {
            body.push(args.cipher.update(packet.header));
            body.push(args.cipher.update(packet.payload));
            body.push(args.cipher.final());
            header.writeUInt32LE(1, TransportProtocol_1.ENCRYPT_TCP_ENCRYPT_POS);
        }
        else {
            body.push(packet.header);
            body.push(Buffer.from(packet.payload));
            header.writeUInt32LE(0, TransportProtocol_1.ENCRYPT_TCP_ENCRYPT_POS);
        }
        header.writeUint32LE(args.requestId, TransportProtocol_1.ENCRYPT_TCP_SEQ_POS);
        args.hmac.update(header);
        for (const buffer of body) {
            args.hmac.update(buffer);
        }
        const hmac = args.hmac.digest();
        return {
            header,
            body,
            hmac
        };
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", DevicePlainPacket)
], DeviceEncryptPacket.prototype, "_devicePacket", void 0);
DeviceEncryptPacket = __decorate([
    DI.Singleton()
], DeviceEncryptPacket);
exports.DeviceEncryptPacket = DeviceEncryptPacket;
//# sourceMappingURL=DevicePacket.js.map