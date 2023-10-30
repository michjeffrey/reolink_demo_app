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
exports.ReplaySession = exports.EPushState = exports.REPLAY_BUFFER_TIME = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Config = __importStar(require("#fx/config"));
const SignalingConnection_1 = require("../device/connection/SignalingConnection");
const ConnectionManager_1 = require("../device/ConnectionManager");
const StreamProvider_1 = require("../device/connection/StreamProvider");
const Logs = __importStar(require("#fx/log"));
const Replay_1 = require("../core/DeviceProtocol/Replay");
const TransportProtocol_1 = require("../core/TransportProtocol");
const Replay_2 = require("../device/signaling/Replay");
const client_1 = require("../../errors/client");
const DeviceStreamManager_1 = require("../device/connection/DeviceStreamManager");
const RtspUrl_1 = require("../dal/RtspUrl");
const DeviceConnection_1 = require("../device/DeviceConnection");
const device_1 = require("../../errors/device");
exports.REPLAY_BUFFER_TIME = 100;
var ERecordStatus;
(function (ERecordStatus) {
    ERecordStatus[ERecordStatus["CREATED"] = 0] = "CREATED";
    ERecordStatus[ERecordStatus["OPENING"] = 1] = "OPENING";
    ERecordStatus[ERecordStatus["OPENED"] = 2] = "OPENED";
})(ERecordStatus || (ERecordStatus = {}));
var EPushState;
(function (EPushState) {
    EPushState[EPushState["READ"] = 0] = "READ";
    EPushState[EPushState["SEND"] = 1] = "SEND";
})(EPushState = exports.EPushState || (exports.EPushState = {}));
let ReplaySession = class ReplaySession {
    constructor() {
        this._sessions = {};
    }
    async getRecordPlayURL(args) {
        const session = await this._createSession(args);
        return session.playURL;
    }
    async onDescribe(args) {
        const session = this._sessions[args.uid][args.requestId];
        if (!session) {
            throw new client_1.E_SESSION_NOT_FOUND();
        }
        if (session.status === ERecordStatus.CREATED) {
            if (args.expiredAt < Date.now()) {
                this._logs.error({
                    'action': 'onDescribe',
                    'message': 'session expired',
                    'data': args
                });
                throw new client_1.E_SESSION_EXIPIRED();
            }
            session.status = ERecordStatus.OPENING;
            try {
                await this._connectionMngr.assertDeviceConnected(args.uid);
                const replayResult = await this._startReplay(args.uid, {
                    'channel': args.channel,
                    'file': args.fileName,
                    'requestId': args.requestId,
                    'streamEncryptMode': this._streamProvider.getStreamEncryptMode(),
                    'port': this._streamProvider.getStreamPort()
                });
                await this._deviceStreamMngr.createLiveStream({
                    'onDeviceStreamClose': this.onDeviceStreamClose.bind(this),
                    'uid': args.uid,
                    'requestId': args.requestId,
                    'videoCodec': replayResult.encodeType,
                    'frameRate': replayResult.frameRate,
                    'pushURL': this._rtspURL.genPushUrl(args),
                    'hasEnd': true
                });
                session.status = ERecordStatus.OPENED;
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
                session.status = ERecordStatus.CREATED;
                for (const wp of this._sessions[args.uid][args.requestId].waitPlayList) {
                    wp.reject(e);
                }
                delete this._sessions[args.uid][args.requestId];
            }
        }
        else if (session.status === ERecordStatus.OPENING) {
            return new Promise((resolve, reject) => {
                this._sessions[args.uid][args.requestId].waitPlayList.push({
                    resolve,
                    reject
                });
            });
        }
    }
    async excuteReplaySeek(args) {
        const playURL = args.playURL;
        for (const uid in this._sessions) {
            for (const requestId in this._sessions[uid]) {
                const session = this._sessions[uid][requestId];
                session.seekSeq = session.seekSeq + 1024;
                if (session.playURL === playURL) {
                    await this._replaySignal.seekReplay({
                        uid,
                        'seekTime': args.seekTime,
                        'seekSeq': session.seekSeq,
                        'requestId': parseInt(requestId),
                        'channel': session.channel
                    });
                    return;
                }
            }
        }
        throw new client_1.E_SESSION_NOT_FOUND();
    }
    async _startReplay(uid, args) {
        const replayRequest = this._replay.constructStartReplayRequest(args);
        const result = await this._deviceConnection.sendRequestToDevice({
            'cmd': replayRequest.cmd,
            uid,
            'data': replayRequest.body,
            'requestId': args.requestId
        });
        return this._replay.parseStartReplayResponse(result);
    }
    async _stopReplay(uid, args) {
        try {
            const requestId = this._signalingConnection.consumeRequestId(uid);
            const replayRequest = this._replay.constructStopReplayRequest(args);
            await this._deviceConnection.sendRequestToDevice({
                'cmd': replayRequest.cmd,
                uid,
                'data': replayRequest.body,
                requestId
            });
            this._logs.debug({
                'action': 'stopReplay',
                'message': 'ok',
                'data': {
                    uid,
                    ...args
                }
            });
        }
        catch (e) {
            this._logs.error({
                'action': 'stopReplay',
                'message': 'nok',
                'data': U.Errors.errorToJson(e)
            });
        }
        return;
    }
    async _createSession(args) {
        await this._connectionMngr.assertDeviceConnected(args.uid);
        const requestId = this._signalingConnection.consumeRequestId(args.uid);
        const replayInfo = await this._replaySignal.getReplayFileInfo({
            'uid': args.uid,
            'channel': args.channel,
            'fileName': args.fileName,
        });
        if (!replayInfo.body?.Param006?.attr001?.attr001) {
            this._logs.info({
                'action': 'createReplaySession',
                'message': 'file not found',
                'data': {
                    args,
                    replayInfo
                }
            });
            throw new device_1.E_FILE_NOT_FOUND();
        }
        const playURL = this._rtspURL.genPlayUrl({
            'type': 'record',
            'channel': args.channel,
            'fileName': args.fileName,
            'uid': args.uid,
            requestId,
            'expiredAt': Date.now() + this._playSessionTTL
        });
        if (!this._sessions[args.uid]) {
            this._sessions[args.uid] = {};
        }
        const expiredAt = Date.now() + this._playSessionTTL;
        this._sessions[args.uid][requestId] = {
            playURL,
            'channel': args.channel,
            'fileName': args.fileName,
            'seekSeq': TransportProtocol_1.DEFAULT_REPLAY_SEQ,
            'waitPlayList': [],
            'status': ERecordStatus.CREATED,
            expiredAt
        };
        this._signalingConnection.renewLastIdleAt(args.uid);
        this._signalingConnection.setKeepBefore(args.uid, expiredAt);
        return this._sessions[args.uid][requestId];
    }
    onDeviceStreamClose(uid, requestId) {
        U.Async.invokeAsync(async () => {
            if (this._sessions[uid]?.[requestId]) {
                const session = this._sessions[uid][requestId];
                try {
                    await this._stopReplay(uid, {
                        'channel': session.channel,
                        'file': session.fileName,
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
    __metadata("design:type", RtspUrl_1.RtspUrl)
], ReplaySession.prototype, "_rtspURL", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingConnection_1.SignalingConnection)
], ReplaySession.prototype, "_signalingConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Replay_2.ReplaySignal)
], ReplaySession.prototype, "_replaySignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", StreamProvider_1.StreamProvider)
], ReplaySession.prototype, "_streamProvider", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ConnectionManager_1.ConnectionManager)
], ReplaySession.prototype, "_connectionMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceStreamManager_1.DeviceStreamManager)
], ReplaySession.prototype, "_deviceStreamMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceConnection_1.DeviceConnection)
], ReplaySession.prototype, "_deviceConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Replay_1.Replay)
], ReplaySession.prototype, "_replay", void 0);
__decorate([
    Config.BindConfig({
        path: 'rtsp.playSessionTTL',
        'validation': 'uint(1000,3600000)',
        'defaultValue': 30000
    }),
    __metadata("design:type", Number)
], ReplaySession.prototype, "_playSessionTTL", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], ReplaySession.prototype, "_logs", void 0);
ReplaySession = __decorate([
    DI.Singleton()
], ReplaySession);
exports.ReplaySession = ReplaySession;
//# sourceMappingURL=ReplaySession.js.map