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
const WifiManager_1 = require("../../services/client/WifiManager");
const tgc = TyG.createInlineCompiler();
class WifiController {
    async getWifiConfig(ctx) {
        const uid = ctx.request.params['uid'];
        const result = await this._wifiMgr.getWifiConfig({
            uid
        });
        ctx.response.sendJSON(result);
    }
    async setWifiConfig(ctx) {
        const uid = ctx.request.params['uid'];
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        await this._wifiMgr.setWifiConfig({
            uid,
            ssid: body.ssid,
            mode: 'station',
            key: body.key,
            countryCode: body.countryCode
        });
        ctx.response.sendJSON(Base_1.HTTP_OK_MESSAGE);
    }
    getWifiScan(ctx) {
        const uid = ctx.request.params['uid'];
        const sessionId = ctx.request.params['session-id'];
        const result = this._wifiMgr.getScanResult({
            uid,
            sessionId
        });
        ctx.response.sendJSON(result);
    }
    async startWifiScanTask(ctx) {
        const uid = ctx.request.params['uid'];
        const result = await this._wifiMgr.createWifiScanTask({
            uid
        });
        ctx.response.sendJSON(result);
    }
    async testWifi(ctx) {
        const uid = ctx.request.params['uid'];
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const result = await this._wifiMgr.testWifi({
            uid,
            mode: 'station',
            ssid: body.ssid,
            key: body.key,
            countryCode: body.countryCode
        });
        ctx.response.sendJSON(result);
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", WifiManager_1.WifiManager)
], WifiController.prototype, "_wifiMgr", void 0);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/settings/wifi-config', {
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
], WifiController.prototype, "getWifiConfig", null);
__decorate([
    Http.Put('/v1.0/devices/{uid:string}/settings/wifi-config', {
        'validator': {
            'body': tgc.compile({
                'rule': {
                    'ssid': '~=^[\\w!@#$%^&*()-=_+[\\]{}|;:\'",./<>?]{1,127}$',
                    'key': '~=^[\\w!@#$%^&*()-=_+[\\]{}|;:\'",./<>?]{0,127}$',
                    'countryCode': '~=^[A-Z]{2}$',
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
], WifiController.prototype, "setWifiConfig", null);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/wifi/scan/{session-id:string}', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard,
                    'session-id': 'string(32)'
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WifiController.prototype, "getWifiScan", null);
__decorate([
    Http.Post('/v1.0/devices/{uid:string}/wifi/scan-task', {
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
], WifiController.prototype, "startWifiScanTask", null);
__decorate([
    Http.Post('/v1.0/devices/{uid:string}/wifi/test', {
        'validator': {
            'body': tgc.compile({
                'rule': {
                    'ssid': '~=^[\\w!@#$%^&*()-=_+[\\]{}|;:\'",./<>?]{1,127}$',
                    'key': '~=^[\\w!@#$%^&*()-=_+[\\]{}|;:\'",./<>?]{0,127}$',
                    'countryCode': '~=^[A-Z]{2}$'
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
], WifiController.prototype, "testWifi", null);
exports.default = WifiController;
//# sourceMappingURL=WifiController.js.map