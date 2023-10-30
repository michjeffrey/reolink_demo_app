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
const _ = __importStar(require("#fx/utils"));
const fs = __importStar(require("fs"));
const OnlineDeviceManager_1 = require("../../services/dal/OnlineDeviceManager");
const TyG = __importStar(require("@litert/typeguard"));
const Config = __importStar(require("#fx/config"));
const client_1 = require("../../errors/client");
const tgc = TyG.createInlineCompiler();
class ManagementController {
    getDeviceList(ctx) {
        const deviceList = this._onlineDeviceMngr.getDeviceList();
        ctx.response.sendJSON({
            'totalRows': deviceList.length,
            'items': deviceList.map(v => {
                return {
                    'family': v.family,
                    'uid': v.uid,
                    'model': v.model,
                    'firmware': v.firmware
                };
            })
        });
    }
    async upgradeFirmware(ctx) {
        const fileName = `${this._upgradeCfg.filePath}/${ctx.request.params.fileName}`;
        if (await _.File.fileExists(fileName)) {
            throw new client_1.E_DUPLICATE_FIRMWARE();
        }
        const buffer = await ctx.request.getContent({
            'type': 'raw'
        });
        fs.writeFileSync(fileName, buffer);
        ctx.response.sendJSON({
            'message': 'ok'
        });
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", OnlineDeviceManager_1.OnlineDeviceManager)
], ManagementController.prototype, "_onlineDeviceMngr", void 0);
__decorate([
    Config.BindConfig({
        'path': 'upgrade',
        'validation': {
            'filePath': 'string(1,255)'
        }
    }),
    __metadata("design:type", Object)
], ManagementController.prototype, "_upgradeCfg", void 0);
__decorate([
    Http.Get('/v1.0/devices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ManagementController.prototype, "getDeviceList", null);
__decorate([
    Http.Post('/v1.0/firmware/{fileName:string}', {
        'validator': {
            'params': tgc.compile({
                'rule': {
                    'fileName': 'string(1,255)'
                }
            })
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManagementController.prototype, "upgradeFirmware", null);
exports.default = ManagementController;
//# sourceMappingURL=ManagementController.js.map