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
const LiveSession_1 = require("../../services/client/LiveSession");
const ReplaySession_1 = require("../../services/client/ReplaySession");
const RtspUrl_1 = require("../../services/dal/RtspUrl");
class RTSPController {
    async onRTSPPlay(ctx) {
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const requestArgs = this._rtspURL.retriveUrl(body.URL);
        if (requestArgs.type === 'live') {
            await this._liveSession.onPlay(requestArgs);
            ctx.response.sendJSON({
                'waitNextIframe': true
            });
        }
        else {
            ctx.response.sendJSON({
                'waitNextIframe': false
            });
        }
    }
    async onRTSPDescribe(ctx) {
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const requestArgs = this._rtspURL.retriveUrl(body.URL);
        if (requestArgs.type === 'live') {
            await this._liveSession.onDescribe(requestArgs);
            ctx.response.sendJSON({
                'gopCached': false
            });
        }
        else {
            await this._replaySession.onDescribe(requestArgs);
            ctx.response.sendJSON({
                'gopCached': true
            });
        }
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", RtspUrl_1.RtspUrl)
], RTSPController.prototype, "_rtspURL", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", LiveSession_1.LiveSession)
], RTSPController.prototype, "_liveSession", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ReplaySession_1.ReplaySession)
], RTSPController.prototype, "_replaySession", void 0);
__decorate([
    Http.Post('/v1.0/rtsp/play'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RTSPController.prototype, "onRTSPPlay", null);
__decorate([
    Http.Post('/v1.0/rtsp/describe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RTSPController.prototype, "onRTSPDescribe", null);
exports.default = RTSPController;
//# sourceMappingURL=RTSPController.js.map