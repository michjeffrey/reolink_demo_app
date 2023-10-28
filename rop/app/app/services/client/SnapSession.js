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
exports.SnapSession = exports.RESP_END_CODE = void 0;
const DI = __importStar(require("#fx/di"));
const Logger = __importStar(require("#fx/log"));
const Config = __importStar(require("#fx/config"));
const _ = __importStar(require("#fx/utils"));
const Snap_1 = require("../core/DeviceProtocol/Snap");
const Command_1 = require("../core/Command");
const ConnectionManager_1 = require("../device/ConnectionManager");
const SignalingConnection_1 = require("../device/connection/SignalingConnection");
const XMLProxy_1 = require("../core/XMLProxy");
const client_1 = require("../../errors/client");
const device_1 = require("../../errors/device");
const Support_1 = require("../../services/device/signaling/Support");
exports.RESP_END_CODE = 201;
let SnapSession = class SnapSession {
    constructor() {
        this._snapReceivers = {};
    }
    _init() {
        this._signalingConnection.setCommandHandler(Command_1.ECommand.NET_SNAP_V30, {
            'okHandler': this.onSnapHandler.bind(this),
            'errHandler': this.onSnapErrorHandler.bind(this)
        });
    }
    async getSnap(args) {
        await this._connectionMngr.assertDeviceConnected(args.uid);
        const requestId = this._signalingConnection.consumeRequestId(args.uid);
        if (this._snapReceivers[args.uid]) {
            throw new client_1.E_DUPLICATE_SNAP();
        }
        const deviceSupport = await this._supportSignal.getSupport(args.uid);
        if (!deviceSupport.channels[args.channel]?.preview?.streamTypes) {
            throw new device_1.E_DEVICE_CHANNEL_NOT_FOUND();
        }
        if (!deviceSupport.channels[args.channel]?.preview?.streamTypes?.includes(args.streamType)) {
            this._logs.error({
                'action': 'getSnap',
                'message': 'streamType not Support',
                'data': args
            });
            throw new device_1.E_STREAM_TYPE_NOT_SUPPORT();
        }
        const promise = new Promise((resolve, reject) => {
            this._snapReceivers[args.uid] = {
                'startAt': Date.now(),
                'expiredAt': Date.now() + this._snapTimeout,
                requestId,
                'buffers': [],
                resolve,
                reject,
                exceptionHanded: false
            };
        });
        const request = this._snap.constructSnapRequest({
            ...args,
            requestId
        });
        try {
            const signalResult = await this._signalingConnection.sendRequestToDevice({
                'cmd': request.cmd,
                requestId,
                'uid': args.uid,
                'data': request.body
            });
            const result = this._xmlProxy.parseXML(signalResult);
            this._logs.debug({
                'action': 'requestSnap',
                'message': 'ok',
                'data': result
            });
        }
        catch (e) {
            this._logs.error({
                'action': 'getSnap',
                'message': 'nok',
                'data': _.Errors.errorToJson(e)
            });
            delete this._snapReceivers[args.uid];
            throw e;
        }
        this._snapReceivers[args.uid].exceptionHanded = true;
        return promise;
    }
    onSnapErrorHandler(uid) {
        if (this._snapReceivers[uid]?.exceptionHanded) {
            this._snapReceivers[uid].reject();
        }
        delete this._snapReceivers[uid];
    }
    onSnapHandler(uid, item, header) {
        if (!this._snapReceivers[uid]) {
            this._logs.error({
                'action': 'onSnapHandler',
                'message': 'uid not found',
                'data': {
                    uid
                }
            });
            return;
        }
        this._snapReceivers[uid].buffers.push(...item.payload);
        if (header.responseCode === exports.RESP_END_CODE) {
            this._snapReceivers[uid].resolve(this._snapReceivers[uid].buffers);
            delete this._snapReceivers[uid];
            this._logs.debug({
                'action': 'onSnapHandler',
                'message': 'snap ok',
                'data': {
                    uid
                }
            });
        }
    }
    checkTimeout() {
        for (const uid in this._snapReceivers) {
            if (this._snapReceivers[uid].expiredAt <= Date.now()) {
                this.onSnapErrorHandler(uid);
            }
        }
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingConnection_1.SignalingConnection)
], SnapSession.prototype, "_signalingConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ConnectionManager_1.ConnectionManager)
], SnapSession.prototype, "_connectionMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Support_1.SupportSignal)
], SnapSession.prototype, "_supportSignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Snap_1.Snap)
], SnapSession.prototype, "_snap", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], SnapSession.prototype, "_xmlProxy", void 0);
__decorate([
    Logger.UseLogger('default'),
    __metadata("design:type", Object)
], SnapSession.prototype, "_logs", void 0);
__decorate([
    Config.BindConfig({
        path: 'timeout.snap',
        'validation': 'uint(5000,)',
        'defaultValue': 10000
    }),
    __metadata("design:type", Number)
], SnapSession.prototype, "_snapTimeout", void 0);
__decorate([
    DI.Initializer(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SnapSession.prototype, "_init", null);
SnapSession = __decorate([
    DI.Singleton()
], SnapSession);
exports.SnapSession = SnapSession;
//# sourceMappingURL=SnapSession.js.map