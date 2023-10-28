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
exports.UpgradeSession = exports.EUpgradeSessionStatus = void 0;
const DI = __importStar(require("#fx/di"));
const Logger = __importStar(require("#fx/log"));
const U = __importStar(require("#fx/utils"));
const Config = __importStar(require("#fx/config"));
const Upgrade_1 = require("../device/signaling/Upgrade");
const client_1 = require("../../errors/client");
const OnlineDeviceManager_1 = require("../dal/OnlineDeviceManager");
const device_1 = require("../../errors/device");
const KeepAliveConnection_1 = require("../device/connection/KeepAliveConnection");
const SignalingConnection_1 = require("../device/connection/SignalingConnection");
var EUpgradeSessionStatus;
(function (EUpgradeSessionStatus) {
    EUpgradeSessionStatus["UPGRADE_SUCCESS"] = "upgrade_success";
    EUpgradeSessionStatus["UPGRADING"] = "upgrading";
    EUpgradeSessionStatus["FAILED"] = "failed";
    EUpgradeSessionStatus["UNKNOWN_ERROR"] = "unknown_error";
    EUpgradeSessionStatus["SAME_VERSION"] = "same_version";
    EUpgradeSessionStatus["FILE_CHECK_FAILED"] = "file_check_failed";
    EUpgradeSessionStatus["OUT_OF_MEMORY"] = "out_of_memory";
    EUpgradeSessionStatus["FOCUS_ERROR"] = "focus_error";
    EUpgradeSessionStatus["LOW_BATTERY"] = "low_battery";
})(EUpgradeSessionStatus = exports.EUpgradeSessionStatus || (exports.EUpgradeSessionStatus = {}));
let UpgradeSession = class UpgradeSession {
    constructor() {
        this._sessions = {};
        this._sessionQty = 0;
    }
    getSession(sessionId, uid) {
        const session = this._sessions[sessionId];
        if (!session || session.expiredAt < Date.now()) {
            return undefined;
        }
        if (session.uid !== uid) {
            return undefined;
        }
        return session;
    }
    _wrapSessionStatus(responseCode) {
        switch (responseCode) {
            case 401:
                return EUpgradeSessionStatus.SAME_VERSION;
            case 403:
                return EUpgradeSessionStatus.FAILED;
            case 402:
                return EUpgradeSessionStatus.FILE_CHECK_FAILED;
            case 404:
                return EUpgradeSessionStatus.OUT_OF_MEMORY;
            case 407:
                return EUpgradeSessionStatus.FOCUS_ERROR;
            case 408:
                return EUpgradeSessionStatus.LOW_BATTERY;
            default:
                return EUpgradeSessionStatus.UNKNOWN_ERROR;
        }
    }
    async createSession(args) {
        if (!args.fileName.endsWith('paks') && !args.fileName.endsWith('pak')) {
            throw new client_1.E_FILE_NAME_INVALID();
        }
        if (this._sessionQty >= this._maxSession) {
            throw new client_1.E_UP_TO_UPGRADE_SESSION_LIMIT();
        }
        for (const sid in this._sessions) {
            if (this._sessions[sid].uid === args.uid &&
                this._sessions[sid].status === EUpgradeSessionStatus.UPGRADING &&
                this._sessions[sid].expiredAt > Date.now() &&
                !this._sessions[sid].isFinalStatus) {
                this._logs.error({
                    'action': 'createUpgradeSession',
                    'message': 'duplicate upgrade',
                    'data': args
                });
                throw new client_1.E_DUPLICATE_UPGRADE();
            }
        }
        const sessionId = U.String.randomString(32);
        await this._upgradeSignal.assertUpgradeFileExists(args.fileName);
        const deviceInfo = this._onlineDeviceMngr.getDevice(args.uid);
        if (!deviceInfo) {
            throw new device_1.E_DEVICE_OFFLINE();
        }
        this._sessions[sessionId] = {
            'status': EUpgradeSessionStatus.UPGRADING,
            'uid': args.uid,
            'expiredIn': Math.floor(this._sessionTTL / 1000),
            'expiredAt': Date.now() + this._sessionTTL,
            'isFinalStatus': false
        };
        U.Async.invokeAsync(async () => {
            try {
                this._sessionQty++;
                const upgradeFile = `${this._upgradeCfg.filePath}/${args.fileName}`;
                const fileSize = await U.File.getFileSize(upgradeFile);
                await this._upgradeSignal.sendUpgradeRequest({
                    ...args,
                    upgradeFile,
                    fileSize
                });
                const deviceInfo = this._onlineDeviceMngr.getDevice(args.uid);
                await this._upgradeSignal.upgradeFirmware(args);
                await new Promise((resolve, reject) => {
                    if (this._onlineDeviceMngr.isBatteryDevice(args.uid)) {
                        this._keepAliveConnection.waitDeviceUpgrade(args.uid, {
                            resolve,
                            reject,
                            'firmware': deviceInfo?.firmware ?? ''
                        });
                    }
                    else {
                        this._signalingConnection.waitDeviceUpgrade(args.uid, {
                            resolve,
                            reject,
                            'firmware': deviceInfo?.firmware ?? ''
                        });
                    }
                    U.Async.invokeAsync(async () => {
                        await U.Async.sleep(300000);
                        if (!this._sessions[sessionId].isFinalStatus) {
                            this._sessions[sessionId].status = EUpgradeSessionStatus.UNKNOWN_ERROR;
                            this._sessions[sessionId].isFinalStatus = true;
                        }
                    });
                });
                this._logs.info({
                    'action': 'upgrade',
                    'message': 'upgrade ok',
                    'data': {
                        'uid': args.uid,
                        'firmware': args.fileName
                    }
                });
                if (!this._sessions[sessionId].isFinalStatus) {
                    this._sessions[sessionId].status = EUpgradeSessionStatus.UPGRADE_SUCCESS;
                    this._sessions[sessionId].isFinalStatus = true;
                }
            }
            catch (e) {
                this._logs.error({
                    'action': 'createSession',
                    'message': 'nok',
                    'data': U.Errors.errorToJson(e)
                });
                if (!this._sessions[sessionId].isFinalStatus) {
                    this._sessions[sessionId].status = this._wrapSessionStatus(e?.metadata?.responseCode);
                    this._sessions[sessionId].isFinalStatus = true;
                }
            }
            finally {
                this._sessionQty--;
            }
        });
        return {
            sessionId,
            'expiredIn': this._sessions[sessionId].expiredIn
        };
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", KeepAliveConnection_1.KeepAliveConnection)
], UpgradeSession.prototype, "_keepAliveConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingConnection_1.SignalingConnection)
], UpgradeSession.prototype, "_signalingConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", OnlineDeviceManager_1.OnlineDeviceManager)
], UpgradeSession.prototype, "_onlineDeviceMngr", void 0);
__decorate([
    Config.BindConfig({
        'path': 'upgrade',
        'validation': {
            'filePath': 'string(1,255)'
        }
    }),
    __metadata("design:type", Object)
], UpgradeSession.prototype, "_upgradeCfg", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", Upgrade_1.UpgradeSignal)
], UpgradeSession.prototype, "_upgradeSignal", void 0);
__decorate([
    Logger.UseLogger('default'),
    __metadata("design:type", Object)
], UpgradeSession.prototype, "_logs", void 0);
__decorate([
    Config.BindConfig({
        'path': 'upgrade.maxSession',
        'validation': 'uint(10,10000)',
        'defaultValue': 100
    }),
    __metadata("design:type", Number)
], UpgradeSession.prototype, "_maxSession", void 0);
__decorate([
    Config.BindConfig({
        'path': 'upgrade.sessionTTL',
        'validation': 'uint(60000,3600000)',
        'defaultValue': 3600000
    }),
    __metadata("design:type", Number)
], UpgradeSession.prototype, "_sessionTTL", void 0);
UpgradeSession = __decorate([
    DI.Singleton()
], UpgradeSession);
exports.UpgradeSession = UpgradeSession;
//# sourceMappingURL=UpradeSession.js.map