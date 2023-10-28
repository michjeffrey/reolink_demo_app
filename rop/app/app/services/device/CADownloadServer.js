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
exports.CADownloadServer = void 0;
const DI = __importStar(require("#fx/di"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const U = __importStar(require("#fx/utils"));
const Logs = __importStar(require("#fx/log"));
const CertManager_1 = require("../dal/CertManager");
let CADownloadServer = class CADownloadServer {
    start(cfg) {
        try {
            const server = https.createServer({
                'key': fs.readFileSync(cfg.key),
                'cert': fs.readFileSync(cfg.cert),
                'ca': fs.readFileSync(cfg.ca)
            }, (req, res) => {
                try {
                    res.setHeader('Connection', 'closed');
                    if (req.method !== 'GET' || !req.url?.startsWith('/v1.0/ca')) {
                        this._logs.info({
                            'action': 'CADownloadServer',
                            'message': 'nok',
                            'data': {
                                'method': req.method,
                                'url': req.url
                            }
                        });
                        res.writeHead(404, 'NOT FOUND');
                        res.end();
                        res.destroy();
                        return;
                    }
                    const ca = this._certMngr.getRootCACert();
                    res.end(JSON.stringify({
                        ca,
                        'now': Math.ceil(Date.now() / 1000)
                    }));
                    res.destroy();
                }
                catch (e) {
                    this._logs.error({
                        'action': 'downloadCACert',
                        'message': 'nok',
                        'data': U.Errors.errorToJson(e)
                    });
                }
            });
            server.listen(cfg.port, '0.0.0.0', () => {
                this._logs.info({
                    'action': 'CADownloadServer',
                    'message': `CADownloadServer listening on port:${cfg.port}`
                });
            });
        }
        catch (e) {
            this._logs.error({
                'action': 'CADownloadServer',
                'message': 'nok',
                'data': U.Errors.errorToJson(e)
            });
        }
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", CertManager_1.CertManager)
], CADownloadServer.prototype, "_certMngr", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], CADownloadServer.prototype, "_logs", void 0);
CADownloadServer = __decorate([
    DI.Singleton()
], CADownloadServer);
exports.CADownloadServer = CADownloadServer;
//# sourceMappingURL=CADownloadServer.js.map