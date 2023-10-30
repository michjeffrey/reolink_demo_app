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
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const CertManager_1 = require("../../services/dal/CertManager");
const AuthCode_1 = require("../../services/dal/AuthCode");
const Base_1 = require("../../services/core/Base");
const TyG = __importStar(require("@litert/typeguard"));
const tgc = TyG.createInlineCompiler();
class DeviceInitialController {
    async createInitialSession(ctx) {
        const caFile = this._certMngr.getRootCACertPath();
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const code = this._authCode.genShortTermCodeByUid({
            'uid': body.uid,
            'expiredAt': Date.now() + this._authCodeCfg.expiredIn * 1000
        });
        ctx.response.sendJSON({
            'uid': body.uid,
            'caHash': crypto.createHash('sha256').update(fs.readFileSync(caFile)).digest().toString('base64'),
            code,
            'host': this._serverHost,
            'getCAPort': this._portConfig.getCAHttps,
            'getCertPort': this._portConfig.getCertHttps,
            'registerPort': this._portConfig.registerHttps,
            'time': Math.ceil(Date.now() / 1000)
        });
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", CertManager_1.CertManager)
], DeviceInitialController.prototype, "_certMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", AuthCode_1.AuthCode)
], DeviceInitialController.prototype, "_authCode", void 0);
__decorate([
    Config.BindConfig({
        'path': 'serverHost',
        'validation': 'string'
    }),
    __metadata("design:type", String)
], DeviceInitialController.prototype, "_serverHost", void 0);
__decorate([
    Config.BindConfig({
        'path': 'authCode',
        'validation': {
            'expiredIn': 'uint'
        }
    }),
    __metadata("design:type", Object)
], DeviceInitialController.prototype, "_authCodeCfg", void 0);
__decorate([
    Config.BindConfig({
        'path': 'ports',
        'validation': {
            'getCAHttps': 'uint(0,65535)',
            'getCertHttps': 'uint(0,65535)',
            'registerHttps': 'uint(0,65535)'
        }
    }),
    __metadata("design:type", Object)
], DeviceInitialController.prototype, "_portConfig", void 0);
__decorate([
    Http.Post('/v1.0/devices/initialization-session', {
        'validator': {
            'body': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeviceInitialController.prototype, "createInitialSession", null);
exports.default = DeviceInitialController;
//# sourceMappingURL=DeviceInitialController.js.map