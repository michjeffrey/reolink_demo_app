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
exports.Replay = void 0;
const DI = __importStar(require("#fx/di"));
const Command_1 = require("../Command");
const Logs = __importStar(require("#fx/log"));
const XMLProxy_1 = require("../XMLProxy");
let Replay = class Replay {
    constructStartReplayRequest(args) {
        const body = this._xmlProxy.constructXML({
            'body': {
                'Param006': {
                    'attr001': {
                        'attr001': args.channel,
                        'attr007': args.file,
                        'attr004': args.requestId,
                        'attr009': args.streamEncryptMode,
                        'attr017': args.port
                    }
                }
            }
        });
        this._logs.debug({
            'action': 'constructStartReplayRequest',
            'message': 'ok',
            'data': {
                body
            }
        });
        return {
            cmd: Command_1.ECommand.NET_REPLAY_V30,
            body
        };
    }
    constructStopReplayRequest(args) {
        const body = this._xmlProxy.constructXML({
            'body': {
                'Param006': {
                    'attr001': {
                        'attr001': args.channel,
                        'attr007': args.file,
                        'attr004': args.requestId
                    }
                }
            }
        });
        return {
            cmd: Command_1.ECommand.NET_REPLAY_STOP_V30,
            body
        };
    }
    constructSeekReplayRequest(args) {
        const body = this._xmlProxy.constructXML({
            'body': {
                'Param008': {
                    'attr001': args.channel,
                    'attr003': args.seekSeq,
                    'attr002': args.seekTime
                }
            }
        });
        return {
            cmd: Command_1.ECommand.NET_REPLAY_SEEK_V30,
            body
        };
    }
    parseStartReplayResponse(buf) {
        if (buf.length < 18) {
            this._logs.error({
                'action': 'parseStartReplayResponse',
                'message': 'nok',
                'data': {
                    'length': buf.length
                }
            });
        }
        const ret = {
            'frameRate': buf.readUInt8(17),
            'encodeType': buf.readUInt8(30)
        };
        this._logs.debug({
            'action': 'parseStartLiveResponse',
            'message': 'ok',
            'data': ret
        });
        return ret;
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], Replay.prototype, "_xmlProxy", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], Replay.prototype, "_logs", void 0);
Replay = __decorate([
    DI.Singleton()
], Replay);
exports.Replay = Replay;
//# sourceMappingURL=Replay.js.map