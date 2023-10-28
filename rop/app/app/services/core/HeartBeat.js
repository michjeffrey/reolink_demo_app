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
exports.HeartBeat = void 0;
const DI = __importStar(require("#fx/di"));
const XMLProxy_1 = require("./XMLProxy");
let HeartBeat = class HeartBeat {
    parseHeartBeatRequest(buffer) {
        const result = this._xmlProxy.parseXML(buffer);
        let batteryState = undefined;
        if (result?.body?.Param001?.attr005) {
            batteryState = {
                'percent': result?.body?.Param001?.attr005?.attr006,
                'chargingStatus': result?.body?.Param001?.attr005?.attr002
            };
        }
        return {
            'noRsp': result?.body?.Param001?.attr004,
            batteryState
        };
    }
    constructHeartBeatResponse() {
        const now = Date.now();
        return this._xmlProxy.constructXML({
            'body': {
                'Param001': {
                    'attr002': Math.floor(now / 1000),
                    'attr003': now % 1000 * 1000
                }
            }
        });
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], HeartBeat.prototype, "_xmlProxy", void 0);
HeartBeat = __decorate([
    DI.Singleton()
], HeartBeat);
exports.HeartBeat = HeartBeat;
//# sourceMappingURL=HeartBeat.js.map