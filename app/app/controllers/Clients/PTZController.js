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
const TyG = __importStar(require("@litert/typeguard"));
const Base_1 = require("../../services/core/Base");
const PTZ_1 = require("../../services/device/signaling/PTZ");
const device_1 = require("../../errors/device");
const Support_1 = require("../../services/device/signaling/Support");
const tgc = TyG.createInlineCompiler();
class PTZController {
    async setDeviceZoom(ctx) {
        const uid = ctx.request.params.uid;
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const deviceSupport = await this._supportSignal.getSupport(uid);
        if (!deviceSupport.channels[body.channel].ptz.zoom) {
            throw new device_1.E_CMD_NOT_SUPPORT();
        }
        await this._ptzSignal.setDeviceZoom(uid, body.channel, body.action);
        ctx.response.sendJSON({
            'message': 'ok'
        });
    }
    async setDeviceFocus(ctx) {
        const uid = ctx.request.params.uid;
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const deviceSupport = await this._supportSignal.getSupport(uid);
        if (!deviceSupport.channels[body.channel].ptz.focus) {
            throw new device_1.E_CMD_NOT_SUPPORT();
        }
        await this._ptzSignal.setDeviceFocus(uid, body.channel, body.action);
        ctx.response.sendJSON({
            'message': 'ok'
        });
    }
    async setDeviceRotate(ctx) {
        const uid = ctx.request.params.uid;
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const deviceSupport = await this._supportSignal.getSupport(uid);
        if (!deviceSupport.channels[body.channel].ptz.pt) {
            throw new device_1.E_CMD_NOT_SUPPORT();
        }
        if (['leftUp', 'leftDown', 'rightUp', 'rightDown'].includes(body.direction)) {
            if (deviceSupport.channels[body.channel].ptz.directions === 4) {
                throw new device_1.E_DIRECTION_NOT_SUPPORT();
            }
        }
        await this._ptzSignal.setDeviceRotate({
            uid,
            'channel': body.channel,
            'direction': body.direction,
            'speed': body.speed
        });
        ctx.response.sendJSON({
            'message': 'ok'
        });
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", PTZ_1.PTZSignal)
], PTZController.prototype, "_ptzSignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Support_1.SupportSignal)
], PTZController.prototype, "_supportSignal", void 0);
__decorate([
    Http.Patch('/v1.0/devices/{uid:string}/ptz/zoom', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            }),
            'body': tgc.compile({
                'rule': {
                    'channel': 'uint(0,31)',
                    'action': ['==inc', '==dec']
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PTZController.prototype, "setDeviceZoom", null);
__decorate([
    Http.Patch('/v1.0/devices/{uid:string}/ptz/focus', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            }),
            'body': tgc.compile({
                'rule': {
                    'channel': 'uint(0,31)',
                    'action': ['==inc', '==dec']
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PTZController.prototype, "setDeviceFocus", null);
__decorate([
    Http.Post('/v1.0/devices/{uid:string}/ptz/rotate', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            }),
            'body': tgc.compile({
                'rule': {
                    'channel': 'uint(0,31)',
                    'direction': ['==none', '==left', '==right', '==up', '==down', '==leftUp', '==leftDown', '==rightUp', '==rightDown'],
                    'speed': 'uint(1,64)'
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PTZController.prototype, "setDeviceRotate", null);
exports.default = PTZController;
//# sourceMappingURL=PTZController.js.map