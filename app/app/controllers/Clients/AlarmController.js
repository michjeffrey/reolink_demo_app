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
const Alarm_1 = require("../../services/device/signaling/Alarm");
const TyG = __importStar(require("@litert/typeguard"));
const Base_1 = require("../../services/core/Base");
const tgc = TyG.createInlineCompiler();
class AlarmController {
    async getPirConfig(ctx) {
        const uid = ctx.request.params['uid'];
        const result = await this._alarmSignal.getPirConfig(uid);
        ctx.response.sendJSON({
            'sensitivity': 101 - parseInt(result.body.Param016.attr003),
            'enabled': !!(result.body.Param016.attr002 !== '0'),
            'reduceMistakes': !!(result.body.Param016.attr001 !== '0'),
        });
    }
    async setPirConfig(ctx) {
        const uid = ctx.request.params['uid'];
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        await this._alarmSignal.setPirConfig(uid, body.enabled, 101 - body.sensitivity, body.reduceMistakes);
        ctx.response.sendJSON(Base_1.HTTP_OK_MESSAGE);
    }
    async getAlarmConfig(ctx) {
        const uid = ctx.request.params['uid'];
        const result = await this._alarmSignal.getAlarmStatus(uid);
        ctx.response.sendJSON({
            'enabled': !!(result.body.Param011.attr001 !== '0')
        });
    }
    async setAlarmConfig(ctx) {
        const uid = ctx.request.params['uid'];
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        await this._alarmSignal.setAlarmStatus(uid, body.enabled);
        ctx.response.sendJSON(Base_1.HTTP_OK_MESSAGE);
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", Alarm_1.AlarmSignal)
], AlarmController.prototype, "_alarmSignal", void 0);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/settings/pir-config', {
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
], AlarmController.prototype, "getPirConfig", null);
__decorate([
    Http.Put('/v1.0/devices/{uid:string}/settings/pir-config', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            }),
            'body': tgc.compile({
                'rule': {
                    'enabled': 'boolean',
                    'sensitivity': 'uint(0,100)',
                    'reduceMistakes': 'boolean'
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlarmController.prototype, "setPirConfig", null);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/settings/alarm', {
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
], AlarmController.prototype, "getAlarmConfig", null);
__decorate([
    Http.Put('/v1.0/devices/{uid:string}/settings/alarm', {
        'validator': {
            'body': tgc.compile({
                'rule': {
                    'enabled': 'boolean'
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlarmController.prototype, "setAlarmConfig", null);
exports.default = AlarmController;
//# sourceMappingURL=AlarmController.js.map