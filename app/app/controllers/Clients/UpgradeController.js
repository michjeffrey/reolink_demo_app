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
const UpradeSession_1 = require("../../services/client/UpradeSession");
const TyG = __importStar(require("@litert/typeguard"));
const client_1 = require("../../errors/client");
const Base_1 = require("../../services/core/Base");
const tgc = TyG.createInlineCompiler();
class UpgradeController {
    async createUpgradeSession(ctx) {
        const uid = ctx.request.params['uid'];
        const body = await ctx.request.getContent({
            'type': 'json'
        });
        const session = await this._upgradeSession.createSession({
            uid,
            'fileName': body.upgradeFile,
            'updateParameter': body.factoryReset ? '1' : '0'
        });
        ctx.response.sendJSON(session);
    }
    getUpgradeSession(ctx) {
        const sessionId = ctx.request.params['session-id'];
        const uid = ctx.request.params['uid'];
        const session = this._upgradeSession.getSession(sessionId, uid);
        if (!session) {
            throw new client_1.E_SESSION_NOT_FOUND();
        }
        ctx.response.sendJSON({
            'status': session.status
        });
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", UpradeSession_1.UpgradeSession)
], UpgradeController.prototype, "_upgradeSession", void 0);
__decorate([
    Http.Post('/v1.0/devices/{uid:string}/upgrade-session', {
        'validator': {
            'body': tgc.compile({
                'rule': {
                    'upgradeFile': 'string(1,255)',
                    'factoryReset': 'boolean'
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
], UpgradeController.prototype, "createUpgradeSession", null);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/upgrade-session/{session-id:string}', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'uid': Base_1.uidTypeGuard,
                    'session-id': 'string(1,255)',
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UpgradeController.prototype, "getUpgradeSession", null);
exports.default = UpgradeController;
//# sourceMappingURL=UpgradeController.js.map