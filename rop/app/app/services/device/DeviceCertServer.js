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
exports.DeviceCertServer = void 0;
const DI = __importStar(require("#fx/di"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const U = __importStar(require("#fx/utils"));
const Logs = __importStar(require("#fx/log"));
const CertManager_1 = require("../dal/CertManager");
const AuthCode_1 = require("../dal/AuthCode");
const client_1 = require("../../errors/client");
const device_1 = require("../../errors/device");
let DeviceCertServer = class DeviceCertServer {
    start(cfg) {
        try {
            const server = https.createServer({
                'key': fs.readFileSync(cfg.key),
                'cert': fs.readFileSync(cfg.cert),
                'ca': fs.readFileSync(cfg.ca)
            }, (req, res) => {
                if (req.method !== 'POST' || !req.url?.startsWith('/v1.0/devices/credetials')) {
                    this._logs.info({
                        'action': 'DeviceCertServer',
                        'message': 'nok',
                        'data': {
                            'method': req.method,
                            'url': req.url
                        }
                    });
                    res.writeHead(404, 'NOT FOUND');
                    res.end();
                    return;
                }
                let data = '';
                req.on('data', (chunk) => {
                    data += chunk.toString();
                });
                req.on('end', () => {
                    res.setHeader('Connection', 'closed');
                    U.Async.invokeAsync(async () => {
                        const socket = res.socket;
                        try {
                            const body = U.String.parseJSON(data, {
                                'onError': () => {
                                    const error = new client_1.E_INVALID_PARAMETER();
                                    res.writeHead(error.metadata['statusCode']);
                                    res.end(JSON.stringify({
                                        'error': {
                                            'message': error.message,
                                            'symbol': error.name
                                        }
                                    }));
                                    this._logs.error({
                                        'action': 'DeviceCertServer',
                                        'message': 'onError',
                                        'data': {
                                            data
                                        }
                                    });
                                    throw error;
                                }
                            });
                            let item;
                            try {
                                item = this._authCode.retriveCode(body.code);
                            }
                            catch (error) {
                                res.end(JSON.stringify({
                                    'error': {
                                        'message': error.message,
                                        'symbol': error.name
                                    }
                                }));
                                throw error;
                            }
                            if (item.uid !== body.uid) {
                                const error = new device_1.E_DEVICE_NOT_MATCHED();
                                res.writeHead(error.metadata['statusCode']);
                                res.end(JSON.stringify({
                                    'error': {
                                        'message': error.message,
                                        'symbol': error.name
                                    }
                                }));
                                throw error;
                            }
                            if (item.expiredAt && item.expiredAt < Date.now()) {
                                const error = new device_1.E_INVALID_CODE();
                                res.writeHead(error.metadata['statusCode']);
                                res.end(JSON.stringify({
                                    'error': {
                                        'message': error.message,
                                        'symbol': error.name
                                    }
                                }));
                                throw error;
                            }
                            const certCfg = await this._certMngr.createClientCert(item.uid);
                            res.end(JSON.stringify({
                                'cert': fs.readFileSync(certCfg.cert).toString(),
                                'code': this._authCode.genLongTermCodeByUid({
                                    'uid': item.uid,
                                    'expiredAt': 0
                                }),
                                'key': fs.readFileSync(certCfg.key).toString()
                            }));
                            socket.end();
                            fs.unlinkSync(certCfg.key);
                            fs.unlinkSync(certCfg.cert);
                        }
                        catch (e) {
                            socket.end();
                            this._logs.error({
                                'action': 'downloadDeviceCert',
                                'message': 'nok',
                                'data': U.Errors.errorToJson(e)
                            });
                        }
                    });
                });
            });
            server.listen(cfg.port, '0.0.0.0', () => {
                this._logs.info({
                    'action': 'DeviceCertServer',
                    'message': `DeviceCertServer listening on port:${cfg.port}`
                });
            });
        }
        catch (e) {
            this._logs.error({
                'action': 'DeviceCertServer',
                'message': 'nok',
                'data': U.Errors.errorToJson(e)
            });
        }
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", CertManager_1.CertManager)
], DeviceCertServer.prototype, "_certMngr", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", AuthCode_1.AuthCode)
], DeviceCertServer.prototype, "_authCode", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], DeviceCertServer.prototype, "_logs", void 0);
DeviceCertServer = __decorate([
    DI.Singleton()
], DeviceCertServer);
exports.DeviceCertServer = DeviceCertServer;
//# sourceMappingURL=DeviceCertServer.js.map