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
exports.AbstractEncryptTCPConnection = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const U = __importStar(require("#fx/utils"));
const crypto = __importStar(require("crypto"));
const EncryptedTCPDecoder_1 = require("../../dal/EncryptedTCPDecoder");
const Handshake_1 = require("../../core/Handshake");
const TCPEncrypt_1 = require("../../core/TCPEncrypt");
const TCPDecrypt_1 = require("../../core/TCPDecrypt");
const Command_1 = require("../../core/Command");
const HelloMessage_1 = require("../../core/HelloMessage");
const TransportProtocol_1 = require("../../core/TransportProtocol");
const Logs = __importStar(require("#fx/log"));
const DeviceSender_1 = require("../../dal/DeviceSender");
const CoreDecoder_1 = require("../../core/CoreDecoder");
const XMLProxy_1 = require("../../core/XMLProxy");
class AbstractEncryptTCPConnection {
    constructor() {
        this._socketCiphers = new WeakMap();
        this._socketDeviceMap = new WeakMap();
        this._socketDecoderMap = new WeakMap();
    }
    _onData(socket, buf) {
        const decoder = this._socketDecoderMap.get(socket);
        if (!decoder) {
            this._logs.error({
                'action': 'onData',
                'message': 'encryptTCPConnection decoder not found',
                'data': {
                    'uid': this._socketDeviceMap.get(socket)
                }
            });
            return;
        }
        let items = decoder.encryptTCPDecoder.push(buf);
        if (!decoder.gotHelloMessage && items.length > 0) {
            try {
                this._handleHelloMessage(socket, items[0].header);
                decoder.gotHelloMessage = true;
                items = items.slice(1);
            }
            catch (e) {
                this._logs.error({
                    'action': 'handleHelloMessage',
                    'message': 'nok',
                    'data': U.Errors.errorToJson(e)
                });
                socket.destroy();
            }
        }
        for (const buffer of items) {
            const cipher = this._socketCiphers.get(socket);
            if (!cipher) {
                this._logs.error({
                    'action': 'handleMessage',
                    'message': 'cipher not found'
                });
                return;
            }
            try {
                const payload = cipher.decrypt.checkAndDecrypt(buffer);
                const dataItems = [];
                for (const body of payload) {
                    if (!body.length) {
                        continue;
                    }
                    dataItems.push(...decoder.coreDecoder.push(body));
                }
                for (const item of dataItems) {
                    const header = this._coreProtocol.parseHeader(item.header);
                    const payload = this._coreProtocol.parsePayload(header, item.payload);
                    this._handleDevicePacket(socket, payload, header);
                }
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
    takeoverSocket(socket, packetCached) {
        this._socketDecoderMap.set(socket, {
            'encryptTCPDecoder': new EncryptedTCPDecoder_1.EncryptTCPDecoder(),
            'coreDecoder': new CoreDecoder_1.CoreDecoder(TransportProtocol_1.CORE_HEADER_LENGTH, TransportProtocol_1.CORE_DATA_LENGTH_POS, TransportProtocol_1.CORE_DATA_LEN_SIZE),
            'gotHelloMessage': false
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
                                'action': 'tcp socket not readable',
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
        socket.on('error', () => {
            socket.destroy();
        });
        socket.on('close', () => {
            this._onClose(socket);
            const uid = this._socketDeviceMap.get(socket);
            this._logs.debug({
                'action': 'onSocketClose',
                'message': 'ok',
                'data': {
                    uid,
                    'conection': 'TCP'
                }
            });
            runable = false;
            this._socketDeviceMap.delete(socket);
            this._socketDecoderMap.delete(socket);
        });
        socket.on('timeout', () => {
            this._logs.error({
                'action': 'TCPSocketTimeout',
                'message': 'nok'
            });
            socket.end();
        });
    }
    _onHandshake(socket, buffer, requestId, subject) {
        const deviceInfo = this._handshake.doHandshake(buffer, subject);
        const uid = deviceInfo.uid;
        if (!deviceInfo.heartBeatInterval) {
            deviceInfo.heartBeatInterval = this._socketTimeout / 2;
        }
        this._socketDeviceMap.set(socket, uid);
        const cipher = this._socketCiphers.get(socket);
        this._deviceSender.sendToDevice({
            packet: {
                'type': 'response',
                'cmd': Command_1.ECommand.NET_APP_HAND_SHAKE_V30,
                requestId,
                'responseCode': TransportProtocol_1.OK_STATUS_CODE,
                'data': this._xml.constructXML({
                    'body': {
                        'Param013': {
                            'attr007': deviceInfo.heartBeatInterval
                        }
                    }
                })
            },
            socket,
            cipher,
            'align16': true
        });
        return deviceInfo;
    }
    _handleHelloMessage(socket, buf) {
        const result = this._helloMessage.handleHelloMessage(socket, buf);
        this._socketCiphers.set(socket, {
            'encrypt': new TCPEncrypt_1.TCPEncrypt(result.secretAccessKey, crypto.createCipheriv(TransportProtocol_1.ENCRYPT_MODE, result.encryptKey.subarray(0, 16), result.encryptKey.subarray(16))),
            'decrypt': new TCPDecrypt_1.TCPDecrypt(result.secretAccessKey, crypto.createDecipheriv(TransportProtocol_1.ENCRYPT_MODE, result.encryptKey.subarray(0, 16), result.encryptKey.subarray(16)))
        });
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], AbstractEncryptTCPConnection.prototype, "_xml", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", HelloMessage_1.HelloMessage)
], AbstractEncryptTCPConnection.prototype, "_helloMessage", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Handshake_1.Handshake)
], AbstractEncryptTCPConnection.prototype, "_handshake", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", TransportProtocol_1.CoreProtocol)
], AbstractEncryptTCPConnection.prototype, "_coreProtocol", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.socket',
        'validation': 'uint',
        'defaultValue': 40000
    }),
    __metadata("design:type", Number)
], AbstractEncryptTCPConnection.prototype, "_socketTimeout", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.recvPacket',
        'validation': 'uint',
        'defaultValue': 200
    }),
    __metadata("design:type", Number)
], AbstractEncryptTCPConnection.prototype, "_recvPacketTimeout", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], AbstractEncryptTCPConnection.prototype, "_logs", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSender_1.EncryptTCPSender)
], AbstractEncryptTCPConnection.prototype, "_deviceSender", void 0);
exports.AbstractEncryptTCPConnection = AbstractEncryptTCPConnection;
//# sourceMappingURL=AbstractEncryptTCPConnection.js.map