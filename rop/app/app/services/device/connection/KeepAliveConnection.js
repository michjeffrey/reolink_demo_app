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
exports.KeepAliveConnection = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const Command_1 = require("../../core/Command");
const TransportProtocol_1 = require("../../core/TransportProtocol");
const AbstractEncryptTCPConnection_1 = require("./AbstractEncryptTCPConnection");
const HeartBeat_1 = require("../../core/HeartBeat");
const XMLProxy_1 = require("../../core/XMLProxy");
const OnlineDeviceManager_1 = require("../../dal/OnlineDeviceManager");
const device_1 = require("../../../errors/device");
let KeepAliveConnection = class KeepAliveConnection extends AbstractEncryptTCPConnection_1.AbstractEncryptTCPConnection {
    constructor() {
        super(...arguments);
        this._deviceConnections = {};
        this._requests = {};
        this._waitUpgradeRecord = {};
    }
    waitDeviceUpgrade(uid, args) {
        this._waitUpgradeRecord[uid] = args;
    }
    getBatteryState(uid) {
        return this._deviceConnections[uid]?.batteryState;
    }
    _handleDevicePacket(socket, packet, header) {
        const requestId = header.requestId;
        switch (header.cmd) {
            case Command_1.ECommand.NET_HEART_BEAT_V30:
                const cipher = this._socketCiphers.get(socket);
                const info = this._heartBeat.parseHeartBeatRequest(Buffer.concat(packet.payload));
                const uid = this._socketDeviceMap.get(socket);
                if (this._deviceConnections[uid]) {
                    this._deviceConnections[uid].lastHeartBeatAt = Date.now();
                    this._deviceConnections[uid].batteryState = info.batteryState;
                }
                if (info.noRsp && info.noRsp === '1') {
                    return;
                }
                this._deviceSender.sendToDevice({
                    packet: {
                        'type': 'response',
                        'cmd': Command_1.ECommand.NET_HEART_BEAT_V30,
                        requestId,
                        'responseCode': TransportProtocol_1.OK_STATUS_CODE,
                        'data': this._heartBeat.constructHeartBeatResponse()
                    },
                    socket,
                    cipher,
                    'align16': true
                });
                break;
            case Command_1.ECommand.NET_APP_HAND_SHAKE_V30:
                const deviceInfo = this._onHandshake(socket, Buffer.concat(packet.payload), requestId, 'keepAlive');
                if (this._deviceConnections[deviceInfo.uid]) {
                    this._logs.error({
                        'action': 'onHandshake',
                        'message': 'device connection not released.',
                        'data': {
                            'uid': deviceInfo.uid
                        }
                    });
                    const socket = this._deviceConnections[deviceInfo.uid].socket;
                    socket.destroy();
                    socket.emit('close');
                }
                if (this._waitUpgradeRecord[deviceInfo.uid]
                    && this._waitUpgradeRecord[deviceInfo.uid].firmware !== deviceInfo.firmware) {
                    this._waitUpgradeRecord[deviceInfo.uid].resolve();
                    delete this._waitUpgradeRecord[deviceInfo.uid];
                }
                this._deviceConnections[deviceInfo.uid] = {
                    socket,
                    requestId: Math.floor(Math.random() * 100000),
                    idledAt: Date.now(),
                    lastHeartBeatAt: Date.now(),
                    heartBeatInterval: deviceInfo.heartBeatInterval
                };
                this._onlineDeviceManager.addDevice({
                    ...deviceInfo,
                    'connection': 'keepAliveConnection'
                });
                break;
            default:
                this._onDeviceResponse(socket, Buffer.concat(packet.payload), requestId);
                break;
        }
    }
    _onClose(socket) {
        const uid = this._socketDeviceMap.get(socket);
        if (uid) {
            this._onlineDeviceManager.reduceDevice({
                uid,
                'connection': 'keepAliveConnection'
            });
            delete this._deviceConnections[uid];
            for (const request in this._requests[uid]) {
                this._requests[uid][request].reject();
            }
            this._requests[uid] = [];
            this._logs.debug({
                'action': 'closed',
                'message': 'ok',
                'data': {
                    'connection': 'keepAlive',
                    uid
                }
            });
        }
        else {
            this._logs.error({
                'action': 'closed',
                'message': 'uid not found'
            });
        }
        this._socketCiphers.delete(socket);
    }
    _onDeviceResponse(socket, buffer, requestId) {
        const uid = this._socketDeviceMap.get(socket);
        if (!uid) {
            this._logs.error({
                'action': 'onDeviceResponse',
                'message': 'uid not found',
                'data': {
                    uid
                }
            });
            throw new device_1.E_DEVICE_CONNECTION_NOT_FOUND();
        }
        const request = this._requests[uid][requestId];
        if (!request) {
            this._logs.error({
                'action': 'onDeviceResponse',
                'message': 'request not found',
                'data': {
                    uid
                }
            });
            throw new device_1.E_REQUEST_NOT_FOUND();
        }
        const result = this._xmlProxy.parseXML(buffer);
        this._logs.debug({
            'action': 'onKeepAliveResponse',
            'message': 'ok',
            'data': {
                'uid': uid,
                ...result,
                'cost': Date.now() - this._requests[uid][requestId].sendAt
            }
        });
        this._requests[uid][requestId].resolve(result);
        delete this._requests[uid][requestId];
    }
    wakeupDevice(uid) {
        const socketInfo = this._deviceConnections[uid];
        if (!socketInfo) {
            this._logs.error({
                'action': 'wakeupDevice',
                'message': 'device not found',
                'data': {
                    uid
                }
            });
            throw new device_1.E_DEVICE_OFFLINE();
        }
        const requestId = socketInfo.requestId;
        socketInfo.requestId++;
        return new Promise((resolve, reject) => {
            const cipher = this._socketCiphers.get(socketInfo.socket);
            this._deviceSender.sendToDevice({
                packet: {
                    'type': 'request',
                    'cmd': Command_1.ECommand.NET_WAKE_UP_V30,
                    requestId,
                    'responseCode': TransportProtocol_1.OK_STATUS_CODE
                },
                'socket': socketInfo.socket,
                cipher,
                'align16': true
            });
            if (!this._requests[uid]) {
                this._requests[uid] = {};
            }
            this._requests[uid][requestId] = {
                resolve,
                reject,
                'sendAt': Date.now(),
                'expiredIn': this._wakeupDeviceTimeout
            };
            this._logs.debug({
                'action': 'sendWakeUpToDevice',
                'message': 'ok',
                'data': {
                    'uid': uid,
                    'type': 'request',
                    'cmd': Command_1.ECommand.NET_WAKE_UP_V30,
                    requestId
                }
            });
        });
    }
    _checkHeartBeatTimeout() {
        for (const uid in this._deviceConnections) {
            if (this._deviceConnections[uid].lastHeartBeatAt
                + this._deviceConnections[uid].heartBeatInterval * 2 < Date.now()) {
                this._logs.error({
                    'action': 'checkHearBeatTimeout',
                    'message': 'nok',
                    'data': {
                        uid,
                        'now': Date.now(),
                        'lastHeartBeatAt': this._deviceConnections[uid].lastHeartBeatAt,
                        'connection': 'keepAliveConnection'
                    }
                });
                this._deviceConnections[uid].socket.destroy();
            }
        }
    }
    _checkRequestTimeout() {
        for (const uid in this._requests) {
            for (const requestId in this._requests[uid]) {
                const request = this._requests[uid][requestId];
                if (request.sendAt + request.expiredIn > Date.now()) {
                    continue;
                }
                request.reject(new device_1.E_CMD_TIMEOUT());
                this._logs.debug({
                    'action': 'keepAliveCheckTimeout',
                    'message': 'ok',
                    'data': {
                        uid,
                        requestId
                    }
                });
                delete this._requests[uid][requestId];
            }
        }
    }
    checkTimeout() {
        this._checkRequestTimeout();
        this._checkHeartBeatTimeout();
    }
    check(uid) {
        return this._deviceConnections[uid] ? true : false;
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", HeartBeat_1.HeartBeat)
], KeepAliveConnection.prototype, "_heartBeat", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], KeepAliveConnection.prototype, "_xmlProxy", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", OnlineDeviceManager_1.OnlineDeviceManager)
], KeepAliveConnection.prototype, "_onlineDeviceManager", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.wakeupDevice',
        'validation': 'uint',
        'defaultValue': 10000
    }),
    __metadata("design:type", Number)
], KeepAliveConnection.prototype, "_wakeupDeviceTimeout", void 0);
KeepAliveConnection = __decorate([
    DI.Singleton()
], KeepAliveConnection);
exports.KeepAliveConnection = KeepAliveConnection;
//# sourceMappingURL=KeepAliveConnection.js.map