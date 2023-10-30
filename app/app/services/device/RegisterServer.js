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
exports.RegisterServer = void 0;
const DI = __importStar(require("#fx/di"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const U = __importStar(require("#fx/utils"));
const Logs = __importStar(require("#fx/log"));
const RegisterManager_1 = require("../dal/RegisterManager");
const Base_1 = require("../core/Base");
const client_1 = require("../../errors/client");
const TyG = __importStar(require("@litert/typeguard"));
const tgc = TyG.createInlineCompiler();
let RegisterServer = class RegisterServer {
    reload(cert) {
        this._server.setSecureContext(cert);
    }
    start(cfg) {
        const tgcRule = tgc.compile({
            'rule': {
                'uid': Base_1.uidTypeGuard
            }
        });
        try {
            this._server = https.createServer({
                'key': fs.readFileSync(cfg.key),
                'cert': fs.readFileSync(cfg.cert),
                'ca': fs.readFileSync(cfg.ca),
                'requestCert': true
            }, (req, res) => {
                if (req.method !== 'POST' || !req.url?.startsWith('/v1.0/devices/registration')) {
                    this._logs.info({
                        'action': 'RegisterServer',
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
                const certificate = req.socket.getPeerCertificate();
                const uid = certificate.subject.CN;
                let data = '';
                req.on('data', (chunk) => {
                    data += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const socket = res.socket;
                        res.setHeader('Connection', 'closed');
                        const error = new client_1.E_INVALID_PARAMETER();
                        const args = U.String.parseJSON(data.toString(), {
                            'onError': () => {
                                res.writeHead(error.metadata['statusCode']);
                                res.end(JSON.stringify({
                                    'error': {
                                        'message': error.message,
                                        'symbol': error.name
                                    }
                                }));
                                socket.end();
                                throw error;
                            }
                        });
                        if (uid !== args.uid || !tgcRule(args)) {
                            this._logs.error({
                                'action': 'register',
                                'message': 'uid not valid',
                                'data': {
                                    uid,
                                    'argsUID': args.uid
                                }
                            });
                            res.writeHead(error.metadata['statusCode']);
                            res.end({
                                'error': {
                                    'message': error.message,
                                    'symbol': error.name
                                }
                            });
                            socket.end();
                        }
                        const result = this._registerMngr.register(args);
                        res.end(JSON.stringify(result));
                        res.destroy();
                    }
                    catch (e) {
                        this._logs.error({
                            'action': 'register',
                            'message': 'nok',
                            'data': U.Errors.errorToJson(e)
                        });
                    }
                });
            });
            this._server.listen(cfg.port, '0.0.0.0', () => {
                this._logs.info({
                    'action': 'RegisterServer',
                    'message': `registerServer listening on port:${cfg.port}`
                });
            });
        }
        catch (e) {
            this._logs.error({
                'action': 'RegisterServer',
                'message': 'nok',
                'data': U.Errors.errorToJson(e)
            });
        }
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", RegisterManager_1.RegisterManager)
], RegisterServer.prototype, "_registerMngr", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], RegisterServer.prototype, "_logs", void 0);
RegisterServer = __decorate([
    DI.Singleton()
], RegisterServer);
exports.RegisterServer = RegisterServer;
//# sourceMappingURL=RegisterServer.js.map