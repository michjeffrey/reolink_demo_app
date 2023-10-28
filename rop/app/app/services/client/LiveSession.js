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
exports.LiveSession = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Config = __importStar(require("#fx/config"));
const Live_1 = require("../core/DeviceProtocol/Live");
const SignalingConnection_1 = require("../device/connection/SignalingConnection");
const ConnectionManager_1 = require("../device/ConnectionManager");
const StreamProvider_1 = require("../device/connection/StreamProvider");
const Logs = __importStar(require("#fx/log"));
const DeviceStreamManager_1 = require("../device/connection/DeviceStreamManager");
const RtspUrl_1 = require("../dal/RtspUrl");
const client_1 = require("../../errors/client");
const DeviceConnection_1 = require("../device/DeviceConnection");
const device_1 = require("../../errors/device");
const Support_1 = require("../../services/device/signaling/Support");
var ELiveStatus;
(function (ELiveStatus) {
    ELiveStatus[ELiveStatus["CREATED"] = 0] = "CREATED";
    ELiveStatus[ELiveStatus["OPENING"] = 1] = "OPENING";
    ELiveStatus[ELiveStatus["OPENED"] = 2] = "OPENED";
})(ELiveStatus || (ELiveStatus = {}));
let LiveSession = class LiveSession {
    constructor() {
        this._sessions = {};
    }
    checkExpiredSession() {
        for (const uid in this._sessions) {
            for (const requestId in this._sessions[uid]) {
                if (this._sessions[uid][requestId].expiredAt < Date.now()) {
                    if (this._sessions[uid][requestId].status === ELiveStatus.CREATED) {
                        delete this._sessions[uid][requestId];
                    }
                }
            }
        }
    }
    async getLivePlayURL(args) {
        for (const uid in this._sessions) {
            if (uid !== args.uid) {
                continue;
            }
            for (const requestId in this._sessions[uid]) {
                if (this._sessions[uid][requestId].channel === args.channel &&
                    this._sessions[uid][requestId].streamType === args.streamType) {
                    return this._sessions[uid][requestId].playURL;
                }
            }
        }
        const session = await this._createSession(args);
        return session.playURL;
    }
    async _createSession(args) {
        await this._connectionMngr.assertDeviceConnected(args.uid);
        const requestId = this._signalingConnection.consumeRequestId(args.uid);
        const deviceSupport = await this._supportSignal.getSupport(args.uid);
        if (!deviceSupport.channels[args.channel]?.preview?.streamTypes) {
            throw new device_1.E_DEVICE_CHANNEL_NOT_FOUND();
        }
        if (!deviceSupport.channels[args.channel]?.preview?.streamTypes?.includes(args.streamType)) {
            this._logs.error({
                'action': 'createLiveSession',
                'message': 'streamType not Support',
                'data': args
            });
            throw new device_1.E_STREAM_TYPE_NOT_SUPPORT();
        }
        if (!this._sessions[args.uid]) {
            this._sessions[args.uid] = {};
        }
        const expiredAt = Date.now() + this._playSessionTTL;
        const playURL = this._rtspURL.genPlayUrl({
            'type': 'live',
            'uid': args.uid,
            'requestId': requestId,
            'streamType': args.streamType,
            'channel': args.channel,
            expiredAt
        });
        this._sessions[args.uid][requestId] = {
            'channel': args.channel,
            playURL,
            'streamType': args.streamType,
            'waitPlayList': [],
            'status': ELiveStatus.CREATED,
            expiredAt
        };
        this._signalingConnection.renewLastIdleAt(args.uid);
        this._signalingConnection.setKeepBefore(args.uid, expiredAt);
        return this._sessions[args.uid][requestId];
    }
    async _startLive(uid, args) {
        const liveRequest = this._live.constructStartLiveRequest(args);
        const result = await this._deviceConnection.sendRequestToDevice({
            'cmd': liveRequest.cmd,
            uid,
            'data': liveRequest.body,
            'requestId': args.requestId
        });
        return this._live.parseStartLiveResponse(result);
    }
    async _requestIframe(uid, args) {
        try {
            const requestId = this._signalingConnection.consumeRequestId(uid);
            const iframeRequest = this._live.constructRequestIframeRequest(args);
            await this._deviceConnection.sendRequestToDevice({
                'cmd': iframeRequest.cmd,
                uid,
                'data': iframeRequest.body,
                requestId
            });
            this._logs.debug({
                'action': 'requestIframe',
                'message': 'ok',
                'data': {
                    uid,
                    ...args
                }
            });
        }
        catch (e) {
            this._logs.error({
                'action': 'stopLive',
                'message': 'nok',
                'data': U.Errors.errorToJson(e)
            });
        }
        return;
    }
    async _stopLive(uid, args) {
        try {
            const requestId = this._signalingConnection.consumeRequestId(uid);
            const recordRequest = this._live.constructStopLiveRequest(args);
            await this._deviceConnection.sendRequestToDevice({
                'cmd': recordRequest.cmd,
                uid,
                'data': recordRequest.body,
                requestId
            });
            this._logs.debug({
                'action': 'stopLive',
                'message': 'ok',
                'data': {
                    uid,
                    ...args
                }
            });
        }
        catch (e) {
            this._logs.error({
                'action': 'stopLive',
                'message': 'nok',
                'data': U.Errors.errorToJson(e)
            });
        }
        return;
    }
    async onPlay(args) {
        await this._requestIframe(args.uid, {
            'channel': args.channel,
            'streamType': args.streamType
        });
    }
    async onDescribe(args) {
        const session = this._sessions[args.uid][args.requestId];
        if (!session) {
            throw new client_1.E_SESSION_NOT_FOUND();
        }
        if (session.status === ELiveStatus.CREATED) {
            if (args.expiredAt < Date.now()) {
                this._logs.error({
                    'action': 'onDescribe',
                    'message': 'session expired',
                    'data': args
                });
                throw new client_1.E_SESSION_EXIPIRED();
            }
            session.status = ELiveStatus.OPENING;
            try {
                await this._connectionMngr.assertDeviceConnected(args.uid);
                const liveResult = await this._startLive(args.uid, {
                    'channel': args.channel,
                    'port': this._streamProvider.getStreamPort(),
                    'requestId': args.requestId,
                    'streamEncryptMode': this._streamProvider.getStreamEncryptMode(),
                    'streamType': args.streamType
                });
                await this._deviceStreamMngr.createLiveStream({
                    'onDeviceStreamClose': this.onDeviceStreamClose.bind(this),
                    'uid': args.uid,
                    'requestId': args.requestId,
                    'videoCodec': liveResult.encodeType,
                    'frameRate': liveResult.frameRate,
                    'pushURL': this._rtspURL.genPushUrl(args),
                    'hasEnd': false
                });
                session.status = ELiveStatus.OPENED;
                for (const wp of this._sessions[args.uid][args.requestId].waitPlayList) {
                    wp.resolve();
                }
                this._sessions[args.uid][args.requestId].waitPlayList = [];
            }
            catch (e) {
                this._logs.error({
                    'action': 'onDescribe',
                    'message': 'nok',
                    'data': U.Errors.errorToJson(e)
                });
                session.status = ELiveStatus.CREATED;
                for (const wp of this._sessions[args.uid][args.requestId].waitPlayList) {
                    wp.reject(e);
                }
                delete this._sessions[args.uid][args.requestId];
            }
        }
        else if (session.status === ELiveStatus.OPENING) {
            return new Promise((resolve, reject) => {
                this._sessions[args.uid][args.requestId].waitPlayList.push({
                    resolve,
                    reject
                });
            });
        }
    }
    onDeviceStreamClose(uid, requestId) {
        U.Async.invokeAsync(async () => {
            if (this._sessions[uid]?.[requestId]) {
                try {
                    await this._stopLive(uid, {
                        'channel': this._sessions[uid][requestId].channel,
                        requestId
                    });
                }
                catch (e) {
                    this._logs.error({
                        'action': 'onDeviceStreamClose',
                        'message': 'nok',
                        'data': U.Errors.errorToJson(e)
                    });
                }
                delete this._sessions[uid][requestId];
            }
        });
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingConnection_1.SignalingConnection)
], LiveSession.prototype, "_signalingConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceConnection_1.DeviceConnection)
], LiveSession.prototype, "_deviceConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", StreamProvider_1.StreamProvider)
], LiveSession.prototype, "_streamProvider", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ConnectionManager_1.ConnectionManager)
], LiveSession.prototype, "_connectionMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceStreamManager_1.DeviceStreamManager)
], LiveSession.prototype, "_deviceStreamMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Support_1.SupportSignal)
], LiveSession.prototype, "_supportSignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", RtspUrl_1.RtspUrl)
], LiveSession.prototype, "_rtspURL", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Live_1.Live)
], LiveSession.prototype, "_live", void 0);
__decorate([
    Config.BindConfig({
        path: 'rtsp.playSessionTTL',
        'validation': 'uint(1000,3600000)',
        'defaultValue': 30000
    }),
    __metadata("design:type", Number)
], LiveSession.prototype, "_playSessionTTL", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], LiveSession.prototype, "_logs", void 0);
LiveSession = __decorate([
    DI.Singleton()
], LiveSession);
exports.LiveSession = LiveSession;
//# sourceMappingURL=LiveSession.js.map