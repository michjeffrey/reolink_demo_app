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
exports.DeviceKeyManager = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const crypto = __importStar(require("crypto"));
let DeviceKeyManager = class DeviceKeyManager {
    _getKeyByUIDHash(uidHash) {
        const keyId = this._deviceAuthConfig.currentKeyIndex;
        const key = this._deviceAuthConfig.deviceKeys[keyId];
        const secretAccessKey = crypto.createHmac('sha256', key).update(uidHash).digest().toString('base64').slice(0, 32);
        return {
            accessKey: keyId + uidHash,
            secretAccessKey
        };
    }
    getKeyByUID(uid) {
        const uidHash = crypto.createHash('sha256').update(uid).digest().toString('hex').slice(0, 16);
        return this._getKeyByUIDHash(uidHash);
    }
    retriveSecretAccessKey(accessKey) {
        const keyId = accessKey.slice(0, 16);
        const uidHash = accessKey.slice(16, 32);
        const key = this._deviceAuthConfig.deviceKeys[keyId];
        const secretAccessKey = crypto.createHmac('sha256', key).update(uidHash).digest().toString('base64').slice(0, 32);
        return secretAccessKey;
    }
    checkIfAccessKeyValid(accessKey) {
        return accessKey.slice(0, 16).startsWith(this._deviceAuthConfig.currentKeyIndex);
    }
};
__decorate([
    Config.BindConfig({
        'path': 'deviceAuth',
        'validation': {
            'currentKeyIndex': 'string(16)'
        }
    }),
    __metadata("design:type", Object)
], DeviceKeyManager.prototype, "_deviceAuthConfig", void 0);
DeviceKeyManager = __decorate([
    DI.Singleton()
], DeviceKeyManager);
exports.DeviceKeyManager = DeviceKeyManager;
//# sourceMappingURL=DeviceKeyManager.js.map