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
exports.UpgradeSignal = exports.MAX_SLICE_FILE_SAME_TIME = exports.MAX_CORE_DATA_LEN = void 0;
const fsP = __importStar(require("fs/promises"));
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Config = __importStar(require("#fx/config"));
const SignalingConnection_1 = require("../connection/SignalingConnection");
const XMLProxy_1 = require("../../core/XMLProxy");
const ConnectionManager_1 = require("../ConnectionManager");
const Command_1 = require("../../core/Command");
const Logs = __importStar(require("#fx/log"));
const device_1 = require("../../../errors/device");
const DeviceConnection_1 = require("../DeviceConnection");
const DeviceSignal_1 = require("./DeviceSignal");
exports.MAX_CORE_DATA_LEN = 36 * 1024;
exports.MAX_SLICE_FILE_SAME_TIME = 30;
let UpgradeSignal = class UpgradeSignal {
    async sendUpgradeRequest(args) {
        await this._deviceSignal.execSetSignal({
            'uid': args.uid,
            'cmd': Command_1.ECommand.NET_UPDATE_DEV_V30,
            'body': {
                'Param012': {
                    'attr001': args.fileName,
                    'attr002': args.fileSize,
                    'attr004': args.updateParameter
                }
            }
        });
    }
    _sendSliceFile(uid, buffer) {
        const requestId = this._signalingConnection.consumeRequestId(uid);
        return this._deviceConnection.sendRequestToDevice({
            'cmd': Command_1.ECommand.NET_UPDATE_DEV_V30,
            requestId,
            uid,
            'externXML': this._xmlProxy.constructXML({
                'Extension': {
                    'binaryData': 1
                }
            }),
            'data': buffer,
            'expiredIn': this._upgradeSignalingTimeout
        });
    }
    async _sendUpgradeFile(args) {
        await this._connectionMngr.assertDeviceConnected(args.uid);
        const reader = await fsP.open(args.upgradeFile, 'r');
        let promises = [];
        const buf = Buffer.allocUnsafe(exports.MAX_CORE_DATA_LEN);
        let offset = 0;
        do {
            const { bytesRead, buffer } = await reader.read(buf, 0, exports.MAX_CORE_DATA_LEN, offset);
            offset += bytesRead;
            if (bytesRead === 0) {
                break;
            }
            promises.push(this._sendSliceFile(args.uid, buffer.subarray(0, bytesRead)));
            if (promises.length >= exports.MAX_SLICE_FILE_SAME_TIME) {
                await Promise.all(promises);
                promises = [];
            }
            if (bytesRead < exports.MAX_CORE_DATA_LEN) {
                if (promises.length > 0) {
                    await Promise.all(promises);
                    promises = [];
                }
                break;
            }
        } while (true);
        await reader.close();
    }
    async assertUpgradeFileExists(fileName) {
        const upgradeFile = `${this._upgradeCfg.filePath}/${fileName}`;
        const result = await U.File.fileExists(upgradeFile);
        if (!result) {
            this._logs.error({
                'action': 'assertUpgradeFileExists',
                'message': 'file not found',
                'data': {
                    upgradeFile
                }
            });
            throw new device_1.E_FILE_NOT_FOUND({
                'action': 'upgrade'
            });
        }
    }
    async upgradeFirmware(args) {
        const upgradeFile = `${this._upgradeCfg.filePath}/${args.fileName}`;
        const fileSize = await U.File.getFileSize(upgradeFile);
        await this._sendUpgradeFile({
            ...args,
            upgradeFile,
            fileSize
        });
        const requestId = this._signalingConnection.consumeRequestId(args.uid);
        await this._deviceConnection.sendRequestToDevice({
            'uid': args.uid,
            'cmd': Command_1.ECommand.NET_SET_DEVICE_SLEEP,
            requestId
        });
    }
};
__decorate([
    Config.BindConfig({
        'path': 'upgrade',
        'validation': {
            'filePath': 'string(1,255)'
        }
    }),
    __metadata("design:type", Object)
], UpgradeSignal.prototype, "_upgradeCfg", void 0);
__decorate([
    Config.BindConfig({
        'path': 'timeout.upgradeSignaling',
        'validation': 'uint',
        'defaultValue': 60000
    }),
    __metadata("design:type", Number)
], UpgradeSignal.prototype, "_upgradeSignalingTimeout", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], UpgradeSignal.prototype, "_logs", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingConnection_1.SignalingConnection)
], UpgradeSignal.prototype, "_signalingConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceConnection_1.DeviceConnection)
], UpgradeSignal.prototype, "_deviceConnection", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", XMLProxy_1.XMLProxy)
], UpgradeSignal.prototype, "_xmlProxy", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ConnectionManager_1.ConnectionManager)
], UpgradeSignal.prototype, "_connectionMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceSignal_1.DeviceSignal)
], UpgradeSignal.prototype, "_deviceSignal", void 0);
UpgradeSignal = __decorate([
    DI.Singleton()
], UpgradeSignal);
exports.UpgradeSignal = UpgradeSignal;
//# sourceMappingURL=Upgrade.js.map