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
exports.Handshake = void 0;
const DI = __importStar(require("#fx/di"));
const Logs = __importStar(require("#fx/log"));
const XMLProxy_1 = require("./XMLProxy");
const DEFAULT_HEART_BEAT_INTERVAL = 240000;
let Handshake = class Handshake {
    doHandshake(buffer, subject) {
        const result = this._xmlProxy.parseXML(buffer.toString());
        const handshakeInfo = result.body.Param013;
        this._logs.info({
            'action': 'doHandshake',
            'message': 'ok',
            'data': {
                ...handshakeInfo,
                subject
            }
        });
        if (handshakeInfo.attr005 === '4G') {
            return {
                'uid': handshakeInfo.attr001,
                'family': handshakeInfo.attr002,
                'model': handshakeInfo.attr003,
                'firmware': handshakeInfo.attr004,
                'netType': handshakeInfo.attr005,
                'op': handshakeInfo.attr006,
                'heartBeatInterval': this._getHeartBeatInterval(handshakeInfo.attr006)
            };
        }
        return {
            'uid': handshakeInfo.attr001,
            'family': handshakeInfo.attr002,
            'model': handshakeInfo.attr003,
            'firmware': handshakeInfo.attr004,
            'netType': handshakeInfo.attr005,
            'op': handshakeInfo.attr006,
            'heartBeatInterval': 0
        };
    }
    _getHeartBeatInterval(op) {
        const data = {
            '22201': {
                'name': 'TIM',
                'ms': 120000
            },
            '46000': {
                'name': 'China Mobile',
                'ms': 1140000
            },
            '46001': {
                'name': 'China Unicom',
                'ms': 540000
            },
            '46011': {
                'name': 'China Telecom',
                'ms': 1140000
            },
            '53024': {
                'name': '2degrees',
                'ms': 60000
            },
            '27205': {
                'name': 'three',
                'ms': 120000
            },
            '27202': {
                'name': 'three',
                'ms': 120000
            },
            '21910': {
                'name': 'A1',
                'ms': 120000
            },
            '34002': {
                'name': 'Outremer',
                'ms': 120000
            },
            '338050': {
                'name': 'Digicel',
                'ms': 120000
            },
            '51502': {
                'name': 'Globe',
                'ms': 120000
            },
            '52503': {
                'name': 'M1',
                'ms': 120000
            },
            '36439': {
                'name': 'BTC',
                'ms': 120000
            },
            '54201': {
                'name': 'Vodafone',
                'ms': 60000
            },
            '338180': {
                'name': 'Flow',
                'ms': 120000
            },
            '344920': {
                'name': 'Flow',
                'ms': 60000
            },
            '348170': {
                'name': 'Flow',
                'ms': 60000
            }
        };
        const result = data[op];
        if (result) {
            return result.ms;
        }
        return DEFAULT_HEART_BEAT_INTERVAL;
    }
};
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], Handshake.prototype, "_logs", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], Handshake.prototype, "_xmlProxy", void 0);
Handshake = __decorate([
    DI.Singleton()
], Handshake);
exports.Handshake = Handshake;
//# sourceMappingURL=Handshake.js.map