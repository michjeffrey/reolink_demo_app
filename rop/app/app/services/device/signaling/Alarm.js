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
exports.AlarmSignal = void 0;
const DI = __importStar(require("#fx/di"));
const Command_1 = require("../../core/Command");
const DeviceSignal_1 = require("./DeviceSignal");
let AlarmSignal = class AlarmSignal {
    async getAlarmStatus(uid) {
        const result = await this._deviceSignal.execGetSignal({
            'uid': uid,
            'cmd': Command_1.ECommand.NET_GET_ALARM_REPORT_SWITCH_STATE_V30,
        });
        return result;
    }
    async getPirConfig(uid) {
        const result = await this._deviceSignal.execGetSignal({
            'uid': uid,
            'cmd': Command_1.ECommand.NET_GET_RF_CFG_V30,
        });
        return result;
    }
    async setPirConfig(uid, enabled, sensiValue, reduceFalseAlarm) {
        await this._deviceSignal.execSetSignal({
            'uid': uid,
            'cmd': Command_1.ECommand.NET_SET_RF_CFG_V30,
            'body': {
                'Param016': {
                    'attr002': enabled ? '1' : '0',
                    'attr003': sensiValue.toString(),
                    'attr001': reduceFalseAlarm ? '1' : '0'
                }
            }
        });
    }
    async setAlarmStatus(uid, enabled) {
        await this._deviceSignal.execSetSignal({
            'uid': uid,
            'cmd': Command_1.ECommand.NET_SET_ALARM_REPORT_SWITCH_STATE_V30,
            'body': {
                'Param011': {
                    'attr001': enabled ? '1' : '0'
                }
            }
        });
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSignal_1.DeviceSignal)
], AlarmSignal.prototype, "_deviceSignal", void 0);
AlarmSignal = __decorate([
    DI.Singleton()
], AlarmSignal);
exports.AlarmSignal = AlarmSignal;
//# sourceMappingURL=Alarm.js.map