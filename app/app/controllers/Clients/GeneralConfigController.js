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
const SysGeneralConfig_1 = require("../../services/device/signaling/SysGeneralConfig");
const TyG = __importStar(require("@litert/typeguard"));
const Base_1 = require("../../services/core/Base");
const tgc = TyG.createInlineCompiler();
class GeneralConfigController {
    async getDeviceSignal(ctx) {
        const uid = ctx.request.params['uid'];
        const cmd = ctx.request.query['cmd'];
        const result = await this._sysGeneralConfig.getDeviceSignal(uid, cmd);
        ctx.response.sendJSON(result);
    }
    async setDeviceSignal(ctx) {
        const uid = ctx.request.params['uid'];
        const cmd = ctx.request.query['cmd'];
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        await this._sysGeneralConfig.setDeviceSignal(uid, cmd, body);
        ctx.response.sendJSON(Base_1.HTTP_OK_MESSAGE);
    }
    async getSysGeneralConfig(ctx) {
        const uid = ctx.request.params['uid'];
        const result = await this._sysGeneralConfig.getSysGeneralConfig(uid);
        ctx.response.sendJSON({
            'deviceName': result.body.Param007.attr012
        });
    }
    async setSysGeneralConfig(ctx) {
        const uid = ctx.request.params['uid'];
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        await this._sysGeneralConfig.setSysGeneralConfig(uid, {
            'body': {
                'Param007': {
                    'attr012': body.deviceName
                }
            }
        });
        ctx.response.sendJSON(Base_1.HTTP_OK_MESSAGE);
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", SysGeneralConfig_1.SysGeneralSignal)
], GeneralConfigController.prototype, "_sysGeneralConfig", void 0);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/signal', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GeneralConfigController.prototype, "getDeviceSignal", null);
__decorate([
    Http.Post('/v1.0/devices/{uid:string}/signal', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GeneralConfigController.prototype, "setDeviceSignal", null);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/settings/general-config', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GeneralConfigController.prototype, "getSysGeneralConfig", null);
__decorate([
    Http.Put('/v1.0/devices/{uid:string}/settings/general-config', {
        'validator': {
            'body': tgc.compile({
                'rule': {
                    'deviceName': '~=/^(?! )[-a-zA-Z0-9 ]{1,31}(?<! )$/'
                }
            }),
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GeneralConfigController.prototype, "setSysGeneralConfig", null);
exports.default = GeneralConfigController;
//# sourceMappingURL=GeneralConfigController.js.map