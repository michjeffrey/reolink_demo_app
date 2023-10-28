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
exports.RegisterManager = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const DeviceKeyManager_1 = require("./DeviceKeyManager");
const Logs = __importStar(require("#fx/log"));
let RegisterManager = class RegisterManager {
    register(args) {
        const result = this._deviceKeyMngr.getKeyByUID(args.uid);
        this._logs.info({
            'action': 'register',
            'message': 'ok',
            'data': {
                'uid': args.uid
            }
        });
        return {
            'accesskey': result.accessKey,
            'keepAliveTCPPort': this._keepAliveTCPPort,
            'signalingTLSPort': this._signalingTLSPort,
            'secretAccesskey': result.secretAccessKey,
            'heartBeatInterval': this._heartBeatInterval
        };
    }
};
__decorate([
    Config.BindConfig({
        'path': 'ports.keepAliveTCP',
        'validation': 'uint(0,65535)'
    }),
    __metadata("design:type", Number)
], RegisterManager.prototype, "_keepAliveTCPPort", void 0);
__decorate([
    Config.BindConfig({
        'path': 'ports.signalingTLS',
        'validation': 'uint(0,65535)'
    }),
    __metadata("design:type", Number)
], RegisterManager.prototype, "_signalingTLSPort", void 0);
__decorate([
    Config.BindConfig({
        'path': 'heartBeatInterval',
        'validation': 'uint(0,65535)',
        'defaultValue': 20
    }),
    __metadata("design:type", Number)
], RegisterManager.prototype, "_heartBeatInterval", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceKeyManager_1.DeviceKeyManager)
], RegisterManager.prototype, "_deviceKeyMngr", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], RegisterManager.prototype, "_logs", void 0);
RegisterManager = __decorate([
    DI.Singleton()
], RegisterManager);
exports.RegisterManager = RegisterManager;
//# sourceMappingURL=RegisterManager.js.map