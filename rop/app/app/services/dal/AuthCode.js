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
exports.AuthCode = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const U = __importStar(require("#fx/utils"));
const crypto = __importStar(require("crypto"));
const device_1 = require("../../errors/device");
const client_1 = require("../../errors/client");
const SHORT_TERM_CODE_LEN = 8;
let AuthCode = class AuthCode {
    constructor() {
        this._shortTermCodes = {};
    }
    genLongTermCodeByUid(args) {
        const content = Buffer.from(JSON.stringify(args)).toString('base64');
        const signature = crypto.createHmac('sha256', this._authCodeCfg.signKey).update(content).digest().toString('base64');
        return `${content}.${signature}`;
    }
    _gcShortTermCodeByUid() {
        for (const code in this._shortTermCodes) {
            if (this._shortTermCodes[code].expiredAt < Date.now()) {
                delete this._shortTermCodes[code];
            }
        }
    }
    genShortTermCodeByUid(args) {
        const code = U.String.randomString(SHORT_TERM_CODE_LEN);
        this._shortTermCodes[code] = args;
        this._gcShortTermCodeByUid();
        return code;
    }
    retriveCode(code) {
        if (code.length === SHORT_TERM_CODE_LEN) {
            if (this._shortTermCodes[code]) {
                return this._shortTermCodes[code];
            }
            else {
                throw new device_1.E_INVALID_CODE();
            }
        }
        const [content, signature] = code.split('.');
        const sig = crypto.createHmac('sha256', this._authCodeCfg.signKey).update(content).digest().toString('base64');
        if (sig !== signature) {
            throw new device_1.E_SIGNATURE_NOT_MATCHED();
        }
        return U.String.parseJSON(Buffer.from(content, 'base64').toString(), {
            'onError': () => {
                throw new client_1.E_INVALID_PARAMETER();
            }
        });
    }
};
__decorate([
    Config.BindConfig({
        'path': 'authCode',
        'validation': {
            'signKey': 'string'
        }
    }),
    __metadata("design:type", Object)
], AuthCode.prototype, "_authCodeCfg", void 0);
AuthCode = __decorate([
    DI.Singleton()
], AuthCode);
exports.AuthCode = AuthCode;
//# sourceMappingURL=AuthCode.js.map