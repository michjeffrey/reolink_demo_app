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
exports.SupportSignal = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const OnlineDeviceManager_1 = require("../../dal/OnlineDeviceManager");
const Command_1 = require("../../core/Command");
const Render_1 = require("../../core/DeviceProtocol/Render");
const DeviceSignal_1 = require("./DeviceSignal");
let SupportSignal = class SupportSignal {
    async getSupport(uid) {
        const support = this._onlineDeviceMngr.getSupport(uid);
        if (support) {
            return support;
        }
        const result = await this._deviceSignal.execGetSignal({
            uid,
            'cmd': Command_1.ECommand.NET_SUPPORT_V30,
        });
        const items = U.Array.ensureArray(result.body.Param005.attr001);
        const deviceSupport = {
            'channels': {}
        };
        for (const item of items) {
            const ptType = parseInt(item.attr003?.attr001 ?? '0');
            const ptControl = parseInt(item.attr003?.attr002 ?? '0');
            const wifiMode = parseInt(item.attr004?.attr001 ?? '0');
            deviceSupport['channels'] = {
                [item.attr001]: {
                    'preview': {
                        'streamTypes': this._deviceProtocolRender.renderStreamTypes(item.attr002.attr001)
                    },
                    'ptz': {
                        'type': ptType,
                        'control': ptControl,
                        'pt': ptType === 2 || ptType === 3 || ptType === 4 || ptType === 5,
                        'zoom': ptType === 2 || ptType === 4 || ptType === 5,
                        'focus': ptType === 1 || ptType === 2 || ptType === 4 || ptType === 5,
                        'directions': (ptControl & 2) === 0 ? 8 : 4
                    },
                    'wifi': {
                        wifiMode
                    }
                }
            };
        }
        this._onlineDeviceMngr.setDeviceSuport(uid, deviceSupport);
        return deviceSupport;
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", Render_1.DeviceProtocolRender)
], SupportSignal.prototype, "_deviceProtocolRender", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSignal_1.DeviceSignal)
], SupportSignal.prototype, "_deviceSignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", OnlineDeviceManager_1.OnlineDeviceManager)
], SupportSignal.prototype, "_onlineDeviceMngr", void 0);
SupportSignal = __decorate([
    DI.Singleton()
], SupportSignal);
exports.SupportSignal = SupportSignal;
//# sourceMappingURL=Support.js.map