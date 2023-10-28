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
exports.DeviceConnection = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Logs = __importStar(require("#fx/log"));
const SignalingConnection_1 = require("./connection/SignalingConnection");
const ConnectionManager_1 = require("./ConnectionManager");
let DeviceConnection = class DeviceConnection {
    async sendRequestToDevice(args) {
        try {
            const result = await this._signalingConnection.sendRequestToDevice(args);
            return result;
        }
        catch (e) {
            if (e.name === 'device_signaling_connection_closed') {
                await this._connectionMngr.assertDeviceConnected(args.uid);
                this._logs.error({
                    'action': 'sendRequestToDevice',
                    'message': 'nok',
                    'data': {
                        'result': 'device_signaling_connection_closed'
                    }
                });
                return this._signalingConnection.sendRequestToDevice(args);
            }
            else {
                this._logs.error({
                    'action': 'sendRequestToDevice',
                    'message': 'nok',
                    'data': U.Errors.errorToJson(e)
                });
                throw e;
            }
        }
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingConnection_1.SignalingConnection)
], DeviceConnection.prototype, "_signalingConnection", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], DeviceConnection.prototype, "_logs", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ConnectionManager_1.ConnectionManager)
], DeviceConnection.prototype, "_connectionMngr", void 0);
DeviceConnection = __decorate([
    DI.Singleton()
], DeviceConnection);
exports.DeviceConnection = DeviceConnection;
//# sourceMappingURL=DeviceConnection.js.map