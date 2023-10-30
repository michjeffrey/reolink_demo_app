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
const OnlineDeviceManager_1 = require("../../services/dal/OnlineDeviceManager");
const TyG = __importStar(require("@litert/typeguard"));
const Base_1 = require("../../services/core/Base");
const device_1 = require("../../errors/device");
const KeepAliveConnection_1 = require("../../services/device/connection/KeepAliveConnection");
const tgc = TyG.createInlineCompiler();
class BatteryController {
    getDeviceBatteryStates(ctx) {
        const uid = ctx.request.params.uid;
        const device = this._onlineDeviceMngr.getDevice(ctx.request.params.uid);
        if (!device) {
            throw new device_1.E_DEVICE_OFFLINE();
        }
        const batteryState = this._keepAliveConn.getBatteryState(uid);
        if (!batteryState) {
            throw new device_1.E_CMD_NOT_SUPPORT();
        }
        const chargingStatusRecord = {
            '0': 'none',
            '1': 'charging',
            '2': 'completed'
        };
        const key = parseInt(batteryState.chargingStatus).toString();
        ctx.response.sendJSON({
            'percent': parseInt(batteryState.percent),
            'chargeStatus': chargingStatusRecord[key],
        });
    }
}
__decorate([
    DI.Inject(),
    __metadata("design:type", OnlineDeviceManager_1.OnlineDeviceManager)
], BatteryController.prototype, "_onlineDeviceMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", KeepAliveConnection_1.KeepAliveConnection)
], BatteryController.prototype, "_keepAliveConn", void 0);
__decorate([
    Http.Get('/v1.0/devices/{uid:string}/states/battery', {
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
    __metadata("design:returntype", void 0)
], BatteryController.prototype, "getDeviceBatteryStates", null);
exports.default = BatteryController;
//# sourceMappingURL=BatteryController.js.map