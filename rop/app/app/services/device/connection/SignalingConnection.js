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
exports.SignalingConnection = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Config = __importStar(require("#fx/config"));
const Command_1 = require("../../core/Command");
const TransportProtocol_1 = require("../../core/TransportProtocol");
const AbstractTLSConnection_1 = require("./AbstractTLSConnection");
const DeviceAlarm_1 = require("../../dal/DeviceAlarm");
const HeartBeat_1 = require("../../core/HeartBeat");
const OnlineDeviceManager_1 = require("../../dal/OnlineDeviceManager");
const device_1 = require("../../../errors/device");
const DeviceStreamManager_1 = require("./DeviceStreamManager");
const DeviceNetInfoManager_1 = require("../../client/DeviceNetInfoManager");
let SignalingConnection = class SignalingConnection extends AbstractTLSConnection_1.AbstractTLSConnection {
    constructor() {
        super(...arguments);
        this._deviceConnections = {};
        this._requests = {};
        this._waitDeviceList = {};
        this._waitUpgradeRecord = {};
        this._cmdHandlers = {};
    }
    waitDeviceUpgrade(uid, args) {
        this._waitUpgradeRecord[uid] = args;
    }
    setCommandHandler(cmd, handler) {
        this._cmdHandlers[cmd] = handler;
    }
    setKeepBefore(uid, keepBefore) {
        if (this._deviceConnections[uid]) {
            this._deviceConnections[uid].keepBefore = keepBefore;
        }
    }
    _onClose(socket) {
        const uid = this._socketDeviceMap.get(socket);
        if (uid) {
            this._onlineDeviceManager.reduceDevice({
                uid,
                'connection': 'signalingConnection'
            });
            delete this._deviceConnections[uid];
            for (const request in this._requests[uid]) {
                if (this._requests[uid][request].cmd === Command_1.ECommand.NET_SET_DEVICE_SLEEP) {
                    this._requests[uid][request].resolve();
                }
                else {
                    this._requests[uid][request].reject(new device_1.E_DEVICE_SIGNALING_CLOSED());
                }
            }
            delete this._requests[uid];
            if (this._waitDeviceList[uid]) {
                for (const wp of this._waitDeviceList[uid]) {
                    wp.reject(new device_1.E_DEVICE_SIGNALING_CLOSED());
                }
            }
            this._waitDeviceList[uid] = [];
            this._logs.debug({
                'action': 'closed',
                'message': 'signaling connection closed ok',
                'data': {
                    uid
                }
            });
            for (const cmd in this._cmdHandlers) {
                this._cmdHandlers[cmd].errHandler(uid, 'onClose');
            }
        }
        else {
            this._logs.error({
                'action': 'closed',
                'message': 'signaling connection closed nok, uid not found'
            });
        }
    }
    _handleDevicePacket(socket, item, header) {
        switch (header.cmd) {
            case Command_1.ECommand.NET_HEART_BEAT_V30:
                this._deviceSender.sendToDevice({
                    'type': 'response',
                    'cmd': Command_1.ECommand.NET_HEART_BEAT_V30,
                    'requestId': header.requestId,
                    'responseCode': TransportProtocol_1.OK_STATUS_CODE,
                    'data': this._heartBeat.constructHeartBeatResponse()
                }, socket);
                const uid = this._socketDeviceMap.get(socket);
                if (this._deviceConnections[uid]) {
                    this._deviceConnections[uid].lastHeartBeatAt = Date.now();
                }
                break;
            case Command_1.ECommand.NET_APP_HAND_SHAKE_V30:
                const deviceInfo = this._onHandshake(socket, Buffer.concat(item.payload), header.requestId, 'signalingConnection');
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
                this._deviceConnections[deviceInfo.uid] = {
                    socket,
                    requestId: Math.floor(Math.random() * 100000),
                    'lastIdledAt': Date.now(),
                    'keepBefore': Date.now(),
                    'lastHeartBeatAt': Date.now()
                };
                if (this._waitUpgradeRecord[deviceInfo.uid]
                    && this._waitUpgradeRecord[deviceInfo.uid].firmware !== deviceInfo.firmware) {
                    this._waitUpgradeRecord[deviceInfo.uid].resolve();
                    delete this._waitUpgradeRecord[deviceInfo.uid];
                }
                this._onlineDeviceManager.addDevice({
                    ...deviceInfo,
                    'connection': 'signalingConnection'
                });
                this._onDeviceConnected(deviceInfo.uid);
                break;
            case Command_1.ECommand.NET_ALARM_V30:
                this._deviceAlarm.doDeviceAlarm({
                    'uid': this._socketDeviceMap.get(socket),
                    'payload': item.payload,
                    'requestId': header.requestId,
                    socket
                });
                this.renewLastIdleAt(this._socketDeviceMap.get(socket));
                break;
            case Command_1.ECommand.NET_REPORT_NETINFO_V30:
                if (item.payload.length) {
                    this._deviceNetInfoMgr.updateDeviceNetInfo(this._socketDeviceMap.get(socket), item.payload[0].toString());
                }
                break;
            default:
                this._onDeviceResponse(socket, item, header);
                break;
        }
    }
    _onDeviceResponse(socket, item, header) {
        const uid = this._socketDeviceMap.get(socket);
        if (!uid) {
            this._logs.error({
                'action': 'onDeviceSignalingResponse',
                'message': 'device not found',
                'data': {
                    uid
                }
            });
            throw new device_1.E_DEVICE_CONNECTION_NOT_FOUND();
        }
        const request = this._requests[uid]?.[header.requestId];
        if (!request) {
            if (this._cmdHandlers[header.cmd]) {
                this._cmdHandlers[header.cmd].okHandler(uid, item, header);
                return;
            }
            this._logs.error({
                'action': 'onDeviceSignalingResponse',
                'message': 'request not found',
                'data': {
                    uid,
                    'requestId': header.requestId
                }
            });
            throw new device_1.E_REQUEST_NOT_FOUND();
        }
        if (header.responseCode !== 200) {
            this._logs.error({
                'action': 'onDeviceSignalingResponse',
                'message': 'nok',
                'data': {
                    'uid': uid,
                    ...header,
                    'cost': Date.now() - this._requests[uid][header.requestId].sendAt
                }
            });
            this._requests[uid][header.requestId].reject(new device_1.E_CMD_EXEC_ERROR({
                'responseCode': header.responseCode
            }));
        }
        else {
            this._requests[uid][header.requestId].resolve(Buffer.concat(item.payload));
            this._logs.debug({
                'action': 'onDeviceSignalingResponse',
                'message': 'ok',
                'data': {
                    'uid': uid,
                    ...header,
                    'cost': Date.now() - this._requests[uid][header.requestId].sendAt
                }
            });
        }
        this._removeRequest(uid, header.requestId);
    }
    _removeRequest(uid, requestId) {
        delete this._requests[uid][requestId];
        if (!this._checkExistRequests(uid)) {
            this.renewLastIdleAt(uid);
            delete this._requests[uid];
        }
    }
    renewLastIdleAt(uid) {
        if (this._deviceConnections[uid]) {
            this._deviceConnections[uid].lastIdledAt = Date.now();
        }
    }
    consumeRequestId(uid) {
        const socketInfo = this._deviceConnections[uid];
        if (!socketInfo) {
            this._logs.error({
                'action': 'sendRequestToDevice',
                'message': 'device not found',
                'data': {
                    uid
                }
            });
            throw new device_1.E_DEVICE_CONNECTION_NOT_FOUND();
        }
        return socketInfo.requestId++;
    }
    sendRequestToDevice(args) {
        const socketInfo = this._deviceConnections[args.uid];
        if (!socketInfo) {
            this._logs.error({
                'action': 'sendRequestToDevice',
                'message': 'device not found',
                'data': {
                    'uid': args.uid
                }
            });
            throw new device_1.E_DEVICE_CONNECTION_NOT_FOUND();
        }
        return new Promise((resolve, reject) => {
            this._deviceSender.sendToDevice({
                'type': 'request',
                'cmd': args.cmd,
                'requestId': args.requestId,
                'responseCode': TransportProtocol_1.OK_STATUS_CODE,
                'data': args.data,
                'externXML': args.externXML
            }, socketInfo.socket);
            if (!this._requests[args.uid]) {
                this._requests[args.uid] = {};
            }
            this._requests[args.uid][args.requestId] = {
                'expiredIn': args.expiredIn ?? this._signalingExecTimeout,
                'sendAt': Date.now(),
                resolve,
                reject,
                'cmd': args.cmd
            };
            this._logs.debug({
                'action': 'sendSignalingToDevice',
                'message': 'ok',
                'data': {
                    'uid': args.uid,
                    'type': 'request',
                    'cmd': args.cmd,
                    'requestId': args.requestId,
                    'responseCode': TransportProtocol_1.OK_STATUS_CODE,
                    'data': args.externXML ? args.externXML : args.data
                }
            });
        });
    }
    check(uid) {
        return this._deviceConnections[uid] ? true : false;
    }
    _onDeviceConnected(uid) {
        if (this._waitDeviceList[uid]) {
            for (const wp of this._waitDeviceList[uid]) {
                wp.resolve();
            }
        }
        this._waitDeviceList[uid] = [];
    }
    waitDeviceConnected(uid) {
        if (this.check(uid)) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            if (!this._waitDeviceList[uid]) {
                this._waitDeviceList[uid] = [];
            }
            this._waitDeviceList[uid].push({
                'waitAt': Date.now(),
                resolve,
                reject
            });
        });
    }
    _checkExistRequests(uid) {
        return this._requests[uid] && Object.keys(this._requests[uid]).length > 0;
    }
    _checkIdleTimeout() {
        for (const uid in this._deviceConnections) {
            if (this._checkExistRequests(uid)) {
                continue;
            }
            if (this._deviceStreamMngr.checkHaveStream(uid)) {
                continue;
            }
            if (!this._onlineDeviceManager.isBatteryDevice(uid)) {
                continue;
            }
            if (this._deviceConnections[uid].keepBefore > Date.now()) {
                continue;
            }
            if (this._deviceConnections[uid].lastIdledAt + this._signalingConnectionIdleTimeout > Date.now()) {
                continue;
            }
            U.Async.invokeAsync(async () => {
                const requestId = this.consumeRequestId(uid);
                await this.sendRequestToDevice({
                    uid,
                    'cmd': Command_1.ECommand.NET_SET_DEVICE_SLEEP,
                    requestId
                });
            });
        }
    }
    _checkHeartBeatTimeout() {
        for (const uid in this._deviceConnections) {
            if (this._deviceConnections[uid].lastHeartBeatAt + this._socketTimeout < Date.now()) {
                this._logs.error({
                    'action': 'checkHearBeatTimeout',
                    'message': 'nok',
                    'data': {
                        uid,
                        'now': Date.now(),
                        'lastHeartBeatAt': this._deviceConnections[uid].lastHeartBeatAt
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
                this._logs.error({
                    'action': 'checkRequestTimeout',
                    'message': 'timeout',
                    'data': {
                        uid,
                        requestId,
                        time: Date.now(),
                        expiredIn: request.expiredIn,
                        sendAt: request.sendAt
                    }
                });
                request.reject(new device_1.E_CMD_TIMEOUT());
                this._removeRequest(uid, parseInt(requestId));
            }
        }
    }
    _checkWakeupTimeout() {
        for (const uid in this._waitDeviceList) {
            const items = this._waitDeviceList[uid];
            for (const item of items) {
                if (item.waitAt + this._wakeupExecTimeout > Date.now()) {
                    continue;
                }
                this._logs.error({
                    'action': 'checkWakeupTimeout',
                    'message': 'timeout',
                    'data': {
                        uid,
                        waitAt: item.waitAt,
                        time: Date.now()
                    }
                });
                item.reject(new device_1.E_WAKE_UP_TIMEOUT());
                this._waitDeviceList[uid] = this._waitDeviceList[uid].slice(1);
            }
        }
    }
    checkTimeout() {
        this._checkIdleTimeout();
        this._checkRequestTimeout();
        this._checkWakeupTimeout();
        this._checkHeartBeatTimeout();
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", OnlineDeviceManager_1.OnlineDeviceManager)
], SignalingConnection.prototype, "_onlineDeviceManager", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", HeartBeat_1.HeartBeat)
], SignalingConnection.prototype, "_heartBeat", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceStreamManager_1.DeviceStreamManager)
], SignalingConnection.prototype, "_deviceStreamMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceNetInfoManager_1.DeviceNetInfoManager)
], SignalingConnection.prototype, "_deviceNetInfoMgr", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.signalingConnectionIdle',
        'validation': 'uint',
        'defaultValue': 10000
    }),
    __metadata("design:type", Number)
], SignalingConnection.prototype, "_signalingConnectionIdleTimeout", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.signalingExec',
        'validation': 'uint',
        'defaultValue': 10000
    }),
    __metadata("design:type", Number)
], SignalingConnection.prototype, "_signalingExecTimeout", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.wakeupExec',
        'validation': 'uint',
        'defaultValue': 10000
    }),
    __metadata("design:type", Number)
], SignalingConnection.prototype, "_wakeupExecTimeout", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceAlarm_1.DeviceAlarm)
], SignalingConnection.prototype, "_deviceAlarm", void 0);
SignalingConnection = __decorate([
    DI.Singleton()
], SignalingConnection);
exports.SignalingConnection = SignalingConnection;
//# sourceMappingURL=SignalingConnection.js.map