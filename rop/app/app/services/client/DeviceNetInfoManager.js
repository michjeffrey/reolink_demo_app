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
exports.DeviceNetInfoManager = void 0;
const DI = __importStar(require("#fx/di"));
const XMLProxy_1 = require("../core/XMLProxy");
const Logger = __importStar(require("#fx/log"));
let DeviceNetInfoManager = class DeviceNetInfoManager {
    constructor() {
        this._deviceNetInfo = new Map();
    }
    updateDeviceNetInfo(uid, payload) {
        try {
            const result = this._xmlProxy.parseXML(payload);
            const data = {
                type: result.body.Param020.attr001
            };
            this._deviceNetInfo.set(uid, data);
            this._logs.debug({
                action: 'updateDeviceNetInfo',
                message: 'ok',
                data: {
                    uid,
                    data
                }
            });
        }
        catch {
            this._logs.error({
                action: 'updateDeviceNetInfo',
                message: 'nok',
                data: {
                    payload
                }
            });
        }
    }
    isWiredNetworkConnected(uid) {
        const data = this._deviceNetInfo.get(uid);
        if (data && data.type === 'wire') {
            return true;
        }
        return false;
    }
};
__decorate([
    Logger.UseLogger('DeviceNetInfoManager'),
    __metadata("design:type", Object)
], DeviceNetInfoManager.prototype, "_logs", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], DeviceNetInfoManager.prototype, "_xmlProxy", void 0);
DeviceNetInfoManager = __decorate([
    DI.Singleton()
], DeviceNetInfoManager);
exports.DeviceNetInfoManager = DeviceNetInfoManager;
//# sourceMappingURL=DeviceNetInfoManager.js.map