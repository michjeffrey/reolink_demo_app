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
exports.ReplaySignal = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Command_1 = require("../../core/Command");
const Time_1 = require("../../core/Time");
const DeviceSignal_1 = require("./DeviceSignal");
let ReplaySignal = class ReplaySignal {
    async seekReplay(args) {
        await this._deviceSignal.execSetSignal({
            'uid': args.uid,
            'cmd': Command_1.ECommand.NET_REPLAY_SEEK_V30,
            'body': {
                'Param008': {
                    'attr001': args.channel,
                    'attr004': args.requestId,
                    'attr003': args.seekSeq,
                    'attr002': this._timeUtil.genDeviceTime(args.seekTime)
                }
            }
        });
    }
    async getReplayCalendar(args) {
        const dayRecordList = [];
        args.channels.map((v) => {
            dayRecordList.push({
                'attr003': v,
                'attr001': v
            });
        });
        const body = await this._deviceSignal.execGetSignal({
            'uid': args.uid,
            'cmd': Command_1.ECommand.NET_GET_REPLAY_CALENDAR_V30,
            'body': {
                'Param009': {
                    'attr001': this._timeUtil.genDeviceTime(args.startTime),
                    'attr002': this._timeUtil.genDeviceTime(args.endTime),
                    'attr003': {
                        'attr001': dayRecordList
                    }
                }
            }
        });
        const items = [];
        if (!body.body.Param009.attr003.attr001.attr002?.attr001) {
            return items;
        }
        const dayTypes = U.Array.ensureArray(body.body.Param009.attr003.attr001.attr002.attr001);
        for (const dayType of dayTypes) {
            items.push({
                'channel': parseInt(body.body.Param009.attr003.attr001.attr001),
                'date': parseInt(dayType.attr001) + 1
            });
        }
        return items;
    }
    async getReplayFileList(args) {
        const startTime = new Date(args.startTime);
        const endTime = new Date(args.endTime);
        const body = await this._deviceSignal.execGetSignal({
            'uid': args.uid,
            'cmd': Command_1.ECommand.NET_FILE_FIND_V30,
            'body': {
                'Param006': {
                    'attr001': {
                        'attr001': args.channel,
                        'attr002': args.streamType,
                        'attr008': 'all',
                        'attr012': {
                            'attr001': startTime.getFullYear(),
                            'attr002': startTime.getMonth() + 1,
                            'attr003': startTime.getDate(),
                            'attr004': startTime.getHours(),
                            'attr005': startTime.getMinutes(),
                            'attr006': startTime.getSeconds()
                        },
                        'attr013': {
                            'attr001': endTime.getFullYear(),
                            'attr002': endTime.getMonth() + 1,
                            'attr003': endTime.getDate(),
                            'attr004': endTime.getHours(),
                            'attr005': endTime.getMinutes(),
                            'attr006': endTime.getSeconds()
                        }
                    }
                }
            }
        });
        return body;
    }
    async getReplayFileInfo(args) {
        const body = await this._deviceSignal.execGetSignal({
            'uid': args.uid,
            'cmd': Command_1.ECommand.NET_FILE_INFO_V30,
            'body': {
                'Param006': {
                    'attr001': {
                        'attr001': args.channel,
                        'attr007': args.fileName
                    }
                }
            }
        });
        return body;
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", Time_1.TimeUtil)
], ReplaySignal.prototype, "_timeUtil", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSignal_1.DeviceSignal)
], ReplaySignal.prototype, "_deviceSignal", void 0);
ReplaySignal = __decorate([
    DI.Singleton()
], ReplaySignal);
exports.ReplaySignal = ReplaySignal;
//# sourceMappingURL=Replay.js.map