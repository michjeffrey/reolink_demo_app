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
exports.RtspUrl = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const U = __importStar(require("#fx/utils"));
const crypto = __importStar(require("crypto"));
const Logs = __importStar(require("#fx/log"));
const device_1 = require("../../errors/device");
const client_1 = require("../../errors/client");
let RtspUrl = class RtspUrl {
    constructor() {
        this._signKey = '';
    }
    _init() {
        this._signKey = U.String.randomString(32);
    }
    genPlayUrl(args) {
        return `${this._playURLPrefix}${this._genPlayPath(args)}`;
    }
    genPushUrl(args) {
        return `rtsp://127.0.0.1:${this._rtspPort}${this._genPlayPath(args)}`;
    }
    _genPlayPath(args) {
        const content = Buffer.from(JSON.stringify(args)).toString('base64url');
        const signature = crypto.createHmac('sha256', this._signKey).update(content).digest().toString('base64url');
        return `/v1.0/live/${content}.${signature}`;
    }
    retriveUrl(url) {
        const code = url.split('/').slice(-1)[0];
        const [content, signature] = code.split('.');
        const sig = crypto.createHmac('sha256', this._signKey).update(content).digest().toString('base64url');
        if (sig !== signature) {
            this._logs.error({
                'action': 'retriveUrl',
                'message': 'signature not matched',
                'data': {
                    url
                }
            });
            throw new device_1.E_SIGNATURE_NOT_MATCHED();
        }
        return U.String.parseJSON(Buffer.from(content, 'base64url').toString(), {
            'onError': () => {
                throw new client_1.E_INVALID_PARAMETER();
            }
        });
    }
};
__decorate([
    Config.BindConfig({
        'path': 'rtsp.playURLPrefix',
        'validation': 'string'
    }),
    __metadata("design:type", String)
], RtspUrl.prototype, "_playURLPrefix", void 0);
__decorate([
    Config.BindConfig({
        'path': 'ports.clientRtsp',
        'validation': 'uint(0,65535)'
    }),
    __metadata("design:type", Number)
], RtspUrl.prototype, "_rtspPort", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], RtspUrl.prototype, "_logs", void 0);
__decorate([
    DI.Initializer(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RtspUrl.prototype, "_init", null);
RtspUrl = __decorate([
    DI.Singleton()
], RtspUrl);
exports.RtspUrl = RtspUrl;
//# sourceMappingURL=RtspUrl.js.map