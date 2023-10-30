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
exports.WifiSignal = void 0;
const DI = __importStar(require("#fx/di"));
const Command_1 = require("../../core/Command");
const DeviceSignal_1 = require("./DeviceSignal");
const Config = __importStar(require("#fx/config"));
const XMLProxy_1 = require("../../core/XMLProxy");
const DeviceConnection_1 = require("../DeviceConnection");
const ConnectionManager_1 = require("../ConnectionManager");
const SignalingConnection_1 = require("../connection/SignalingConnection");
let WifiSignal = class WifiSignal {
    getWifiConfigSignal(uid) {
        return this._deviceSignal.execGetSignal({
            uid,
            cmd: Command_1.ECommand.NET_GET_WIFI_INFO_V30,
            body: {
                'Param019': {
                    'attr008': 1
                }
            }
        });
    }
    async setWifiConfigSignal(uid, config) {
        await this._deviceSignal.execSetSignal({
            uid,
            cmd: Command_1.ECommand.NET_SET_WIFI_INFO_V30,
            body: config.body
        });
    }
    async startWifiScanTask(uid) {
        await this._connectionMngr.assertDeviceConnected(uid);
        const requestId = this._signalingConnection.consumeRequestId(uid);
        const signalResult = await this._deviceConnection.sendRequestToDevice({
            'cmd': Command_1.ECommand.NET_GET_WIFI_INFO_V30,
            requestId,
            uid,
            'data': this._xmlProxy.constructXML({
                'body': {
                    'Param019': {
                        'attr008': 0
                    }
                }
            }),
            expiredIn: this._scanWifiTimeout
        });
        const result = this._xmlProxy.parseXML(signalResult);
        return result;
    }
    async testWifi(uid, config) {
        await this._connectionMngr.assertDeviceConnected(uid);
        const requestId = this._signalingConnection.consumeRequestId(uid);
        await this._deviceConnection.sendRequestToDevice({
            'cmd': Command_1.ECommand.NET_WIFI_TEST_V30,
            requestId,
            uid,
            'data': this._xmlProxy.constructXML({
                'body': config.body
            }),
            expiredIn: this._testWifiTimeout
        });
        return {
            status: 'success'
        };
    }
};
__decorate([
    Config.BindConfig({
        path: 'wifi.scanWifiTimeout',
        defaultValue: 30000
    }),
    __metadata("design:type", Number)
], WifiSignal.prototype, "_scanWifiTimeout", void 0);
__decorate([
    Config.BindConfig({
        path: 'wifi.testWifiTimeout',
        defaultValue: 30000
    }),
    __metadata("design:type", Number)
], WifiSignal.prototype, "_testWifiTimeout", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSignal_1.DeviceSignal)
], WifiSignal.prototype, "_deviceSignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceConnection_1.DeviceConnection)
], WifiSignal.prototype, "_deviceConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], WifiSignal.prototype, "_xmlProxy", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ConnectionManager_1.ConnectionManager)
], WifiSignal.prototype, "_connectionMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingConnection_1.SignalingConnection)
], WifiSignal.prototype, "_signalingConnection", void 0);
WifiSignal = __decorate([
    DI.Singleton()
], WifiSignal);
exports.WifiSignal = WifiSignal;
//# sourceMappingURL=WifiSignal.js.map