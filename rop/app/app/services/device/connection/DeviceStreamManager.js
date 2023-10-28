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
exports.DeviceStreamManager = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Config = __importStar(require("#fx/config"));
const Logs = __importStar(require("#fx/log"));
const StreamDecoder_1 = require("../../core/StreamDecoder");
const StreamPusher_1 = require("../../dal/StreamPusher");
const XMLProxy_1 = require("../../core/XMLProxy");
let DeviceStreamManager = class DeviceStreamManager {
    constructor() {
        this._streams = {};
    }
    onDeviceConnecionClose(uid) {
        for (const requestId in this._streams[uid]) {
            this.stopLiveStream({
                uid,
                'requestId': parseInt(requestId)
            });
        }
        this._streams[uid] = {};
    }
    async createLiveStream(args) {
        if (!this._streams[args.uid]) {
            this._streams[args.uid] = {};
        }
        const streamPusher = new StreamPusher_1.StreamPusher(args.pushURL, args.frameRate, this._portConfig.clientRtsp, args.uid, args.requestId, args.videoCodec, this.onPusherClose.bind(this), args.hasEnd);
        await streamPusher.connectRtspServer();
        await streamPusher.announceStream();
        this._streams[args.uid][args.requestId] = {
            'onDeviceStreamClose': args.onDeviceStreamClose,
            'lastPushedAt': Date.now(),
            'streamDecoder': new StreamDecoder_1.StreamDecoder(),
            streamPusher
        };
        this._logs.debug({
            'action': 'createLiveStream',
            'message': 'ok',
            'data': args
        });
        await U.Async.sleep(10);
    }
    onPusherClose(uid, requestId) {
        this.stopLiveStream({
            uid,
            requestId
        });
    }
    stopLiveStream(args) {
        if (this._streams[args.uid][args.requestId]) {
            this._streams[args.uid][args.requestId].onDeviceStreamClose(args.uid, args.requestId);
            delete this._streams[args.uid][args.requestId];
        }
    }
    parseStream(streamDecoder, buffers, frameStartMark) {
        const streamItems = [];
        let startMark = frameStartMark;
        for (const buf of buffers) {
            streamItems.push(...streamDecoder.push(buf, startMark));
            startMark = undefined;
        }
        return streamItems;
    }
    onDeviceStream(args) {
        if (!this._streams[args.uid]?.[args.requestId]) {
            this._logs.error({
                'action': 'onDeviceStream',
                'message': 'requestId not found',
                'data': {
                    'uid': args.uid,
                    'requestId': args.requestId
                }
            });
            return;
        }
        const request = this._streams[args.uid][args.requestId];
        this._streams[args.uid][args.requestId].lastPushedAt = Date.now();
        let frameType = undefined;
        if (args.externXML) {
            const xmlResult = this._xmlProxy.parseXML(args.externXML);
            frameType = xmlResult?.Extension?.frame_type;
        }
        const streamItems = this.parseStream(request.streamDecoder, args.streamBuffers, frameType);
        if (streamItems.length) {
            if (!request.streamPusher) {
                this._logs.error({
                    'action': 'onDeviceStream',
                    'message': 'pusher not found',
                });
            }
            else {
                request.streamPusher.pushStream(streamItems);
            }
        }
    }
    checkHaveStream(uid) {
        return this._streams[uid] && Object.keys(this._streams[uid]).length > 0;
    }
    checkStreamTimeout() {
        for (const uid in this._streams) {
            for (const requestId in this._streams[uid]) {
                if (this._streams[uid][requestId].lastPushedAt) {
                    if (this._streams[uid][requestId].lastPushedAt + this._streamTimeout < Date.now()) {
                        this.stopLiveStream({
                            uid,
                            'requestId': parseInt(requestId)
                        });
                        this._logs.info({
                            'action': 'checkstreamTimeout',
                            'message': 'ok',
                            'data': {
                                uid,
                                requestId
                            }
                        });
                    }
                }
            }
        }
    }
};
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], DeviceStreamManager.prototype, "_logs", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.streamTimeout',
        'validation': 'uint',
        'defaultValue': 30000
    }),
    __metadata("design:type", Number)
], DeviceStreamManager.prototype, "_streamTimeout", void 0);
__decorate([
    Config.BindConfig({
        'path': 'ports',
        'validation': {
            'clientRtsp': 'uint(0,65535)'
        }
    }),
    __metadata("design:type", Object)
], DeviceStreamManager.prototype, "_portConfig", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], DeviceStreamManager.prototype, "_xmlProxy", void 0);
DeviceStreamManager = __decorate([
    DI.Singleton()
], DeviceStreamManager);
exports.DeviceStreamManager = DeviceStreamManager;
//# sourceMappingURL=DeviceStreamManager.js.map