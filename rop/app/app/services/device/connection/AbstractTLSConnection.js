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
exports.AbstractTLSConnection = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const CoreDecoder_1 = require("../../core/CoreDecoder");
const TransportProtocol_1 = require("../../core/TransportProtocol");
const U = __importStar(require("#fx/utils"));
const Logs = __importStar(require("#fx/log"));
const Command_1 = require("../../core/Command");
const Handshake_1 = require("../../core/Handshake");
const DeviceSender_1 = require("../../dal/DeviceSender");
const device_1 = require("../../../errors/device");
class AbstractTLSConnection {
    constructor() {
        this._socketDeviceMap = new WeakMap();
        this._socketDecoderMap = new WeakMap();
    }
    _onData(socket, buf) {
        const decoder = this._socketDecoderMap.get(socket);
        if (!decoder) {
            this._logs.error({
                'action': 'onData',
                'message': 'TLSConnection decoder not found'
            });
            return;
        }
        const resultBuffers = decoder.push(buf);
        if (resultBuffers.length > 0) {
            for (const item of resultBuffers) {
                try {
                    const header = this._coreProtocol.parseHeader(item.header);
                    const payload = this._coreProtocol.parsePayload(header, item.payload);
                    this._handleDevicePacket(socket, payload, header);
                }
                catch (e) {
                    this._logs.error({
                        'action': 'handleDevicePacket',
                        'message': 'nok',
                        'data': U.Errors.errorToJson(e)
                    });
                    socket.destroy();
                }
            }
        }
    }
    takeoverSocket(socket, packetCached) {
        this._socketDecoderMap.set(socket, new CoreDecoder_1.CoreDecoder(TransportProtocol_1.CORE_HEADER_LENGTH, TransportProtocol_1.CORE_DATA_LENGTH_POS, TransportProtocol_1.CORE_DATA_LEN_SIZE));
        const certificate = socket.getPeerCertificate();
        const uid = certificate.subject.CN;
        this._socketDeviceMap.set(socket, uid);
        socket.setTimeout(this._socketTimeout, () => {
            this._logs.error({
                'action': 'TLSSocketTimeout',
                'message': 'nok',
                'data': {
                    uid
                }
            });
            socket.destroy();
        });
        let runable = true;
        if (!packetCached) {
            socket.on('data', (buf) => {
                this._onData(socket, buf);
            });
        }
        else {
            U.Async.invokeAsync(async () => {
                do {
                    do {
                        if (!socket) {
                            runable = false;
                            break;
                        }
                        const buf = socket.read();
                        if (!buf) {
                            break;
                        }
                        if (!socket?.readable) {
                            this._logs.error({
                                'action': 'tls socket not readable',
                                'message': 'nok'
                            });
                            break;
                        }
                        this._onData(socket, buf);
                        await U.Async.sleep(1);
                    } while (true);
                    await U.Async.sleep(this._recvPacketTimeout);
                } while (runable);
            });
        }
        socket.on('error', (err) => {
            this._logs.error({
                'action': 'onSocketError',
                'message': 'nok',
                'data': U.Errors.errorToJson(err)
            });
            socket.destroy();
        });
        socket.on('close', () => {
            const uid = this._socketDeviceMap.get(socket);
            this._logs.debug({
                'action': 'onSocketClose',
                'message': 'ok',
                'data': {
                    uid,
                    'conection': 'TLS'
                }
            });
            runable = false;
            this._onClose(socket);
            this._socketDecoderMap.delete(socket);
            this._socketDeviceMap.delete(socket);
        });
    }
    _onHandshake(socket, buffer, requestId, subject) {
        const deviceInfo = this._handshake.doHandshake(buffer, subject);
        const uid = this._socketDeviceMap.get(socket);
        if (uid !== deviceInfo.uid) {
            this._logs.error({
                'action': 'onHandshake',
                'message': 'uid not match',
                'data': {
                    uid,
                    'deviceUID': deviceInfo.uid
                }
            });
            socket.end();
            throw new device_1.E_DEVICE_NOT_MATCHED();
        }
        this._deviceSender.sendToDevice({
            'type': 'response',
            'cmd': Command_1.ECommand.NET_APP_HAND_SHAKE_V30,
            requestId,
            'responseCode': TransportProtocol_1.OK_STATUS_CODE
        }, socket);
        return deviceInfo;
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", Handshake_1.Handshake)
], AbstractTLSConnection.prototype, "_handshake", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSender_1.PlainSender)
], AbstractTLSConnection.prototype, "_deviceSender", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", TransportProtocol_1.CoreProtocol)
], AbstractTLSConnection.prototype, "_coreProtocol", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.socket',
        'validation': 'uint',
        'defaultValue': 40000
    }),
    __metadata("design:type", Number)
], AbstractTLSConnection.prototype, "_socketTimeout", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.recvPacket',
        'validation': 'uint',
        'defaultValue': 200
    }),
    __metadata("design:type", Number)
], AbstractTLSConnection.prototype, "_recvPacketTimeout", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], AbstractTLSConnection.prototype, "_logs", void 0);
exports.AbstractTLSConnection = AbstractTLSConnection;
//# sourceMappingURL=AbstractTLSConnection.js.map