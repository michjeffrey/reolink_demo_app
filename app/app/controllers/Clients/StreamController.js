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
const Http = __importStar(require("@litert/http"));
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const U = __importStar(require("#fx/utils"));
const LiveSession_1 = require("../../services/client/LiveSession");
const ReplaySession_1 = require("../../services/client/ReplaySession");
const Time_1 = require("../../services/core/Time");
const Replay_1 = require("../../services/device/signaling/Replay");
const ReplayView_1 = require("../../services/render/ReplayView");
const TyG = __importStar(require("@litert/typeguard"));
const client_1 = require("../../errors/client");
const Base_1 = require("../../services/core/Base");
const tgc = TyG.createInlineCompiler();
const streamGuard = ['==mainStream', '==subStream', '==externStream'];
class StreamController {
    async getReplayList(ctx) {
        const uid = ctx.request.params['uid'];
        const recordDate = ctx.request.query['record_date'];
        const startAt = ctx.request.query['start_at'];
        const endAt = ctx.request.query['end_at'];
        let startTime = `${recordDate} ${startAt}`;
        const endTime = `${recordDate} ${endAt}`;
        if (!Date.parse(startTime) || !Date.parse(endTime)) {
            throw new client_1.E_INVALID_PARAMETER();
        }
        let rows = 0;
        if (ctx.request.query['next_token']) {
            const nextTokenContent = U.String.parseJSON(Buffer.from(ctx.request.query['next_token'], 'base64url').toString(), {
                'onError': () => {
                    throw new client_1.E_INVALID_PARAMETER();
                }
            });
            startTime = nextTokenContent.nextTime;
            if (!Date.parse(startTime)) {
                throw new client_1.E_INVALID_PARAMETER();
            }
            rows = nextTokenContent.rows;
        }
        if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
            throw new client_1.E_INVALID_PARAMETER();
        }
        const result = await this._replaySignal.getReplayFileList({
            uid,
            startTime,
            endTime,
            'streamType': ctx.request.query['stream_type'],
            'channel': ctx.request.query['channel']
        });
        ctx.response.sendJSON(this._replayView.createUserView(result, rows));
    }
    async getReplayCalendar(ctx) {
        const uid = ctx.request.params['uid'];
        const year = ctx.request.query['year'];
        const month = ctx.request.query['month'];
        const [startAt, endAt] = U.DateTime.getTimeRangeOfMonth(parseInt(year), parseInt(month) - 1);
        const startTime = this._timeUtil.formatTimeToString(startAt);
        const endTime = this._timeUtil.formatTimeToString(endAt);
        const channel = ctx.request.query['channel'];
        const items = await this._replaySignal.getReplayCalendar({
            uid,
            startTime,
            endTime,
            'channels': [channel]
        });
        ctx.response.sendJSON({
            'totalRows': items.length,
            items
        });
    }
    async createReplaySession(ctx) {
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const uid = ctx.request.params['uid'];
        const playURL = await this._replaySession.getRecordPlayURL({
            uid,
            'channel': body.channel,
            'fileName': body.fileName
        });
        ctx.response.sendJSON({
            playURL,
            'expiredIn': this._playSessionTTL / 1000
        });
    }
    async createLiveSession(ctx) {
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const uid = ctx.request.params['uid'];
        const playURL = await this._liveSession.getLivePlayURL({
            uid,
            'channel': body.channel,
            'streamType': body.streamType
        });
        ctx.response.sendJSON({
            playURL,
            'expiredIn': this._playSessionTTL / 1000
        });
    }
    onNotFound(ctx) {
        ctx.response.statusCode = 404;
        ctx.response.statusMessage = 'NOT FOUND';
        ctx.response.sendJSON({
            'message': 'resource not found.'
        });
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", LiveSession_1.LiveSession)
], StreamController.prototype, "_liveSession", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ReplaySession_1.ReplaySession)
], StreamController.prototype, "_replaySession", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Replay_1.ReplaySignal)
], StreamController.prototype, "_replaySignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Time_1.TimeUtil)
], StreamController.prototype, "_timeUtil", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ReplayView_1.ReplayView)
], StreamController.prototype, "_replayView", void 0);
__decorate([
    Config.BindConfig({
        path: 'rtsp.playSessionTTL',
        'validation': 'uint(1000,3600000)',
        'defaultValue': 30000
    }),
    __metadata("design:type", Number)
], StreamController.prototype, "_playSessionTTL", void 0);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/records', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            }),
            'query': tgc.compile({
                'rule': {
                    'record_date': 'string(1,255)',
                    'start_at': 'string(1,16)',
                    'end_at': 'string(1,16)',
                    'next_token?': 'string(1,255)',
                    'stream_type': ['==mainStream', '==subStream'],
                    'channel': ['$.string', 'int(0,31)']
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamController.prototype, "getReplayList", null);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/records/calendar', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            }),
            'query': tgc.compile({
                'rule': {
                    'year': ['$.string', 'int(2000,3000)'],
                    'month': ['$.string', 'int(1,12)'],
                    'channel': ['$.string', 'int(0,31)']
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamController.prototype, "getReplayCalendar", null);
__decorate([
    Http.Post('/v1.0/devices/{uid:string}/records/play-session', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            }),
            'body': tgc.compile({
                'rule': {
                    'fileName': 'string(1,255)',
                    'channel': 'uint(0,31)'
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamController.prototype, "createReplaySession", null);
__decorate([
    Http.Post('/v1.0/devices/{uid:string}/live/play-session', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            }),
            'body': tgc.compile({
                'rule': {
                    'streamType': streamGuard,
                    'channel': 'uint(0,31)'
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamController.prototype, "createLiveSession", null);
__decorate([
    Http.NotFound(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamController.prototype, "onNotFound", null);
exports.default = StreamController;
//# sourceMappingURL=StreamController.js.map