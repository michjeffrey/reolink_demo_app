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
exports.Live = void 0;
const DI = __importStar(require("#fx/di"));
const Command_1 = require("../Command");
const Logs = __importStar(require("#fx/log"));
const XMLProxy_1 = require("../XMLProxy");
let Live = class Live {
    constructStopLiveRequest(args) {
        const body = this._xmlProxy.constructXML({
            'body': {
                'Param002': {
                    'attr001': args.channel,
                    'attr002': args.requestId
                }
            }
        });
        return {
            cmd: Command_1.ECommand.NET_PREVIEW_STOP_V30,
            body
        };
    }
    constructRequestIframeRequest(args) {
        const body = this._xmlProxy.constructXML({
            'body': {
                'Param003': {
                    'attr001': args.channel,
                    'attr002': args.streamType,
                }
            }
        });
        return {
            cmd: Command_1.ECommand.NET_REQUEST_IFRAME_V30,
            body
        };
    }
    constructStartLiveRequest(args) {
        const body = this._xmlProxy.constructXML({
            'body': {
                'Param002': {
                    'attr001': args.channel,
                    'attr002': args.requestId,
                    'attr003': args.streamType,
                    'attr004': args.streamEncryptMode,
                    'attr008': args.port
                }
            }
        });
        return {
            cmd: Command_1.ECommand.NET_PREVIEW_V30,
            body
        };
    }
    parseStartLiveResponse(buf) {
        if (buf.length < 18) {
            this._logs.error({
                'action': 'parseStartLiveResponse',
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
], Live.prototype, "_xmlProxy", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], Live.prototype, "_logs", void 0);
Live = __decorate([
    DI.Singleton()
], Live);
exports.Live = Live;
//# sourceMappingURL=Live.js.map