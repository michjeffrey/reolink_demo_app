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
exports.DeviceAlarm = void 0;
const DI = __importStar(require("#fx/di"));
const Command_1 = require("../core/Command");
const TransportProtocol_1 = require("../core/TransportProtocol");
const XMLProxy_1 = require("../core/XMLProxy");
const DeviceSender_1 = require("./DeviceSender");
const Config = __importStar(require("#fx/config"));
const Logs = __importStar(require("#fx/log"));
const U = __importStar(require("#fx/utils"));
const HttpClient = __importStar(require("@litert/http-client"));
let DeviceAlarm = class DeviceAlarm {
    constructor() {
        this._httpClient = HttpClient.createHttpClient();
    }
    doDeviceAlarm(args) {
        const result = this._xmlProxy.parseXML(Buffer.concat(args.payload));
        this._deviceSender.sendToDevice({
            'type': 'response',
            'cmd': Command_1.ECommand.NET_ALARM_V30,
            'requestId': args.requestId,
            'responseCode': TransportProtocol_1.OK_STATUS_CODE
        }, args.socket);
        U.Async.invokeAsync(async () => {
            if (!this._alarmCfg.enabled) {
                return;
            }
            try {
                const alarmEvent = result.body.Param014.attr001;
                delete alarmEvent['$'];
                delete alarmEvent['recording'];
                delete alarmEvent['timeStamp'];
                const content = JSON.stringify({
                    'uid': args.uid,
                    'channelId': alarmEvent.attr001,
                    'status': alarmEvent.attr002,
                    'AItype': alarmEvent.attr003
                });
                let data = '';
                if (this._alarmCfg.notificationURL.includes('qyapi.weixin.qq.com')) {
                    data = JSON.stringify({
                        'msgtype': 'text',
                        'text': {
                            content
                        }
                    });
                }
                else {
                    data = content;
                }
                const httpResult = await this._httpClient.request({
                    'url': this._alarmCfg.notificationURL,
                    'method': 'POST',
                    data
                });
                this._logs.debug({
                    'action': 'doDeviceAlarm',
                    'message': 'ok',
                    'data': {
                        'uid': args.uid,
                        'statusCode': httpResult.statusCode
                    }
                });
            }
            catch (e) {
                this._logs.error({
                    'action': 'doDeviceAlarm',
                    'message': 'nok',
                    'data': U.Errors.errorToJson(e)
                });
            }
        });
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], DeviceAlarm.prototype, "_xmlProxy", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSender_1.PlainSender)
], DeviceAlarm.prototype, "_deviceSender", void 0);
__decorate([
    Config.BindConfig({
        'path': 'alarm',
        'validation': {
            'enabled': 'boolean',
            'notificationURL': 'string(0,1024)'
        }
    }),
    __metadata("design:type", Object)
], DeviceAlarm.prototype, "_alarmCfg", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], DeviceAlarm.prototype, "_logs", void 0);
DeviceAlarm = __decorate([
    DI.Singleton()
], DeviceAlarm);
exports.DeviceAlarm = DeviceAlarm;
//# sourceMappingURL=DeviceAlarm.js.map