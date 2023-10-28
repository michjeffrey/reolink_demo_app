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
exports.ServerCertScheduler = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const Logs = __importStar(require("#fx/log"));
const U = __importStar(require("#fx/utils"));
const CertManager_1 = require("../services/dal/CertManager");
const RegisterServer_1 = require("../services/device/RegisterServer");
const SignalingServer_1 = require("../services/device/SignalingServer");
const StreamTLSServer_1 = require("../services/device/StreamTLSServer");
let ServerCertScheduler = class ServerCertScheduler {
    async _run() {
        do {
            try {
                const isTimeout = this._certMngr.checkServerCertTimeout();
                if (isTimeout) {
                    const cert = await this._certMngr.renewServerCert();
                    this._registerServer.reload(cert);
                    this._signalingServer.reload(cert);
                    this._streamTLSServer.reload(cert);
                }
            }
            catch (e) {
                this._logs.error({
                    'action': 'ServerCertScheduler',
                    'message': 'nok',
                    'data': U.Errors.errorToJson(e)
                });
            }
            finally {
                await U.Async.sleep(this._interval);
            }
        } while (true);
    }
    start() {
        U.Async.invokeAsync(async () => {
            this._logs.info({
                'action': 'ServerCertScheduler',
                'message': 'ok'
            });
            await this._run();
        });
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", CertManager_1.CertManager)
], ServerCertScheduler.prototype, "_certMngr", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], ServerCertScheduler.prototype, "_logs", void 0);
__decorate([
    Config.BindConfig({
        'path': 'interval.checkServerCert',
        'validation': 'uint',
        'defaultValue': 3600000
    }),
    __metadata("design:type", Number)
], ServerCertScheduler.prototype, "_interval", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", RegisterServer_1.RegisterServer)
], ServerCertScheduler.prototype, "_registerServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingServer_1.SignalingServer)
], ServerCertScheduler.prototype, "_signalingServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", StreamTLSServer_1.StreamTLSServer)
], ServerCertScheduler.prototype, "_streamTLSServer", void 0);
ServerCertScheduler = __decorate([
    DI.Singleton()
], ServerCertScheduler);
exports.ServerCertScheduler = ServerCertScheduler;
//# sourceMappingURL=ServerCertScheduler.js.map