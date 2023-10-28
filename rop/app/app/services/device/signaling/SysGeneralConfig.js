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
exports.SysGeneralSignal = void 0;
const DI = __importStar(require("#fx/di"));
const Command_1 = require("../../core/Command");
const DeviceSignal_1 = require("./DeviceSignal");
let SysGeneralSignal = class SysGeneralSignal {
    async getDeviceSignal(uid, cmd) {
        const result = await this._deviceSignal.execGetSignal({
            uid,
            cmd,
        });
        return result;
    }
    async setDeviceSignal(uid, cmd, signal) {
        await this._deviceSignal.execSetSignal({
            uid,
            cmd,
            'body': signal.body
        });
    }
    async getSysGeneralConfig(uid) {
        const result = await this._deviceSignal.execGetSignal({
            uid,
            'cmd': Command_1.ECommand.NET_GET_SYSGENERAL_CFG_V30,
        });
        return result;
    }
    async setSysGeneralConfig(uid, config) {
        await this._deviceSignal.execSetSignal({
            uid,
            'cmd': Command_1.ECommand.NET_SET_SYSGENERAL_CFG_V30,
            'body': config.body
        });
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSignal_1.DeviceSignal)
], SysGeneralSignal.prototype, "_deviceSignal", void 0);
SysGeneralSignal = __decorate([
    DI.Singleton()
], SysGeneralSignal);
exports.SysGeneralSignal = SysGeneralSignal;
//# sourceMappingURL=SysGeneralConfig.js.map