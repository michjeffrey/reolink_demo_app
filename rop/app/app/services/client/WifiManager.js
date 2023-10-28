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
exports.WifiManager = exports.DEFAULT_CHANNEL = exports.EWifiSupportMode = exports.EEncryptMode = exports.EFreqPolicy = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Config = __importStar(require("#fx/config"));
const E = __importStar(require("../../errors/client"));
const WifiSignal_1 = require("../device/signaling/WifiSignal");
const Logger = __importStar(require("#fx/log"));
const DeviceNetInfoManager_1 = require("./DeviceNetInfoManager");
const DE = __importStar(require("../../errors/device"));
const Support_1 = require("../device/signaling/Support");
var EFreqPolicy;
(function (EFreqPolicy) {
    EFreqPolicy[EFreqPolicy["ALL"] = 0] = "ALL";
    EFreqPolicy[EFreqPolicy["AUTO_5G"] = 1] = "AUTO_5G";
    EFreqPolicy[EFreqPolicy["AUTO_24G"] = 2] = "AUTO_24G";
    EFreqPolicy[EFreqPolicy["ONLY_5G"] = 3] = "ONLY_5G";
    EFreqPolicy[EFreqPolicy["ONLY_24G"] = 4] = "ONLY_24G";
})(EFreqPolicy = exports.EFreqPolicy || (exports.EFreqPolicy = {}));
var EEncryptMode;
(function (EEncryptMode) {
    EEncryptMode[EEncryptMode["NONE"] = 0] = "NONE";
    EEncryptMode[EEncryptMode["AUTO"] = 1] = "AUTO";
})(EEncryptMode = exports.EEncryptMode || (exports.EEncryptMode = {}));
var EWifiSupportMode;
(function (EWifiSupportMode) {
    EWifiSupportMode[EWifiSupportMode["NOT_SUPPORT"] = 0] = "NOT_SUPPORT";
    EWifiSupportMode[EWifiSupportMode["ONLY_24G"] = 1] = "ONLY_24G";
    EWifiSupportMode[EWifiSupportMode["ONLY_5G"] = 2] = "ONLY_5G";
})(EWifiSupportMode = exports.EWifiSupportMode || (exports.EWifiSupportMode = {}));
exports.DEFAULT_CHANNEL = 0;
let WifiManager = class WifiManager {
    constructor() {
        this._scanSessions = new Map();
        this._scanTasks = new Map();
    }
    updateSessionStatus(sessionId, status) {
        const session = this._scanSessions.get(sessionId);
        if (session) {
            session.status = status;
            this._scanSessions.set(sessionId, session);
        }
    }
    clearSession() {
        const now = Date.now();
        for (const [key, value] of this._scanSessions) {
            if (value.expiringAt <= now) {
                this._scanSessions.delete(key);
            }
        }
    }
    logs() {
        console.log('_scanSessions', this._scanSessions);
        console.log('_scanTasks', this._scanTasks);
    }
    async createWifiScanTask(args) {
        const supportWifi = await this._isSupportWifi(args.uid, exports.DEFAULT_CHANNEL);
        if (!supportWifi) {
            throw new DE.E_CMD_NOT_SUPPORT();
        }
        const task = this._scanTasks.get(args.uid);
        if (task?.running) {
            const session = this._scanSessions.get(task.sessionId);
            if (session) {
                return {
                    sessionId: task.sessionId,
                    expiringAt: session.expiringAt
                };
            }
        }
        const sessionId = U.String.randomString(32);
        const newTask = {
            sessionId,
            running: true
        };
        this._scanTasks.set(args.uid, newTask);
        const expiringAt = Date.now() + this._wifiSessionTTL * 1000;
        this._scanSessions.set(sessionId, {
            status: 'scanning',
            wifiList: [],
            expiringAt
        });
        U.Async.invokeAsync(async () => {
            try {
                const convertorETS = U.Enum.createEnumToStringConvertor(EEncryptMode);
                const result = await this._wifiSignal.startWifiScanTask(args.uid);
                this._logs.debug({
                    action: 'scan wifi result',
                    message: 'ok',
                    data: result
                });
                const session = this._scanSessions.get(sessionId);
                const list = [];
                for (const item of result.body.Param019.attr003.attr001) {
                    if (item.attr001.length !== 0) {
                        list.push({
                            ssid: item.attr001,
                            signal: item.attr002,
                            encryptMode: convertorETS(item.attr003)
                        });
                    }
                }
                this._logs.debug({
                    action: 'scan wifi session',
                    message: 'ok',
                    data: session
                });
                if (session) {
                    session.status = 'success';
                    session.wifiList = list;
                    this._scanSessions.set(sessionId, session);
                }
            }
            catch (e) {
                this._logs.error({
                    action: 'startWifiScanTask',
                    message: 'nok',
                    data: U.Errors.errorToJson(e)
                });
                if (e.name === 'cmd_timeout') {
                    this.updateSessionStatus(sessionId, 'timeout');
                }
                else {
                    this.updateSessionStatus(sessionId, 'error');
                }
            }
            finally {
                this._scanTasks.delete(args.uid);
            }
        });
        return {
            sessionId,
            expiringAt
        };
    }
    getScanResult(args) {
        const session = this._scanSessions.get(args.sessionId);
        if (!session) {
            throw new E.E_SESSION_NOT_FOUND();
        }
        return {
            status: session.status,
            wifiList: session.wifiList
        };
    }
    async getWifiConfig(args) {
        const supportWifi = await this._isSupportWifi(args.uid, exports.DEFAULT_CHANNEL);
        if (!supportWifi) {
            throw new DE.E_CMD_NOT_SUPPORT();
        }
        const result = await this._wifiSignal.getWifiConfigSignal(args.uid);
        return {
            ssid: result.body.Param019.attr004,
            channel: Number(result.body.Param019.attr006),
            countryCode: result.body.Param019.attr007
        };
    }
    async setWifiConfig(args) {
        const supportWifi = await this._isSupportWifi(args.uid, exports.DEFAULT_CHANNEL);
        if (!supportWifi) {
            throw new DE.E_CMD_NOT_SUPPORT();
        }
        await this._wifiSignal.setWifiConfigSignal(args.uid, {
            'body': {
                'Param019': {
                    'attr002': args.mode,
                    'attr004': args.ssid,
                    'attr005': args.key,
                    'attr007': args.countryCode
                }
            }
        });
    }
    async testWifi(args) {
        const supportWifi = await this._isSupportWifi(args.uid, exports.DEFAULT_CHANNEL);
        if (!supportWifi) {
            throw new DE.E_CMD_NOT_SUPPORT();
        }
        if (!this._deviceNetInfoMgr.isWiredNetworkConnected(args.uid)) {
            throw new DE.E_CMD_NOT_SUPPORT();
        }
        try {
            const result = await this._wifiSignal.testWifi(args.uid, {
                'body': {
                    'Param019': {
                        'attr002': args.mode,
                        'attr004': args.ssid,
                        'attr005': args.key,
                        'attr007': args.countryCode
                    }
                }
            });
            this._logs.debug({
                action: 'testWifi result',
                message: 'ok',
                data: {
                    result
                }
            });
            return result;
        }
        catch (e) {
            if (e.name === 'cmd_timeout') {
                throw e;
            }
            else {
                return {
                    status: 'error'
                };
            }
        }
    }
    async _isSupportWifi(uid, channel) {
        const supportWifi = await this._supportSignal.getSupport(uid);
        if (supportWifi.channels[channel]['wifi'].wifiMode === EWifiSupportMode.ONLY_24G
            || supportWifi.channels[channel]['wifi'].wifiMode === EWifiSupportMode.ONLY_5G) {
            return true;
        }
        return false;
    }
};
__decorate([
    Logger.UseLogger('WifiManager'),
    __metadata("design:type", Object)
], WifiManager.prototype, "_logs", void 0);
__decorate([
    Config.BindConfig({
        path: 'wifiSessionTTL',
        defaultValue: 600
    }),
    __metadata("design:type", Number)
], WifiManager.prototype, "_wifiSessionTTL", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", WifiSignal_1.WifiSignal)
], WifiManager.prototype, "_wifiSignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Support_1.SupportSignal)
], WifiManager.prototype, "_supportSignal", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceNetInfoManager_1.DeviceNetInfoManager)
], WifiManager.prototype, "_deviceNetInfoMgr", void 0);
WifiManager = __decorate([
    DI.Singleton()
], WifiManager);
exports.WifiManager = WifiManager;
//# sourceMappingURL=WifiManager.js.map