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
require("ts-alias-loader");
const app = __importStar(require("#fx/app"));
const Config = __importStar(require("#fx/config"));
const _ = __importStar(require("#fx/utils"));
const DI = __importStar(require("#fx/di"));
const Logs = __importStar(require("#fx/log"));
const SchedulerRunner_1 = require("./schedulers/SchedulerRunner");
const AppServer_1 = require("./services/client/AppServer");
const RTSPServer_1 = require("./services/client/RTSPServer");
const CertManager_1 = require("./services/dal/CertManager");
const CADownloadServer_1 = require("./services/device/CADownloadServer");
const DeviceCertServer_1 = require("./services/device/DeviceCertServer");
const KeepAliveServer_1 = require("./services/device/KeepAliveServer");
const RegisterServer_1 = require("./services/device/RegisterServer");
const SignalingServer_1 = require("./services/device/SignalingServer");
const StreamTCPServer_1 = require("./services/device/StreamTCPServer");
const StreamTLSServer_1 = require("./services/device/StreamTLSServer");
let AppReolinkOpenPlatform = class AppReolinkOpenPlatform extends app.AbstractApplication {
    async main() {
        console.log('hello, my Application instance ID is', this._cfg.instanceId);
        const certConfig = await this._certManager.initServerCert();
        this._caDownloadServer.start({
            'port': this._portConfig.getCAHttps,
            ...certConfig
        });
        this._deviceCertServer.start({
            port: this._portConfig.getCertHttps,
            ...certConfig
        });
        this._signalServer.start({
            port: this._portConfig.signalingTLS,
            ...certConfig
        });
        this._registerServer.start({
            port: this._portConfig.registerHttps,
            ...certConfig
        });
        this._appServer.start(this._portConfig.clientHttp);
        this._keepAliveServer.start(this._portConfig.keepAliveTCP);
        this._streamTCPServer.start(this._portConfig.streamTCP);
        this._streamTLSServer.start({
            port: this._portConfig.streamTLS,
            ...certConfig
        });
        this._rtspServer.start(this._portConfig.clientRtsp, this._portConfig.clientHttp);
        this._schedulerRunner.run();
        this._logs.info({
            'action': 'start',
            'message': 'ok'
        });
        await this._termination.wait();
        return 0;
    }
    static async setup(ctr) {
        if (!process.argv[2]) {
            console.info('Usage: node app/app.ts /path/to/config.json');
            throw new Error('Configuration file is not specified.');
        }
        (await Config.getManager(ctr)).load(process.argv[2]);
    }
};
__decorate([
    Config.BindConfig({ path: 'application' }),
    __metadata("design:type", Object)
], AppReolinkOpenPlatform.prototype, "_cfg", void 0);
__decorate([
    Config.BindConfig({
        'path': 'ports',
        'validation': {
            'signalingTLS': 'uint(0,65535)',
            'registerHttps': 'uint(0,65535)',
            'getCAHttps': 'uint(0,65535)',
            'getCertHttps': 'uint(0,65535)',
            'keepAliveTCP': 'uint(0,65535)',
            'streamTCP': 'uint(0,65535)',
            'streamTLS': 'uint(0,65535)',
            'clientHttp': 'uint(0,65535)',
            'clientRtsp': 'uint(0,65535)'
        }
    }),
    __metadata("design:type", Object)
], AppReolinkOpenPlatform.prototype, "_portConfig", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], AppReolinkOpenPlatform.prototype, "_logs", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingServer_1.SignalingServer)
], AppReolinkOpenPlatform.prototype, "_signalServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", RegisterServer_1.RegisterServer)
], AppReolinkOpenPlatform.prototype, "_registerServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", AppServer_1.AppServer)
], AppReolinkOpenPlatform.prototype, "_appServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", StreamTCPServer_1.StreamTCPServer)
], AppReolinkOpenPlatform.prototype, "_streamTCPServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", StreamTLSServer_1.StreamTLSServer)
], AppReolinkOpenPlatform.prototype, "_streamTLSServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", KeepAliveServer_1.KeepAliveServer)
], AppReolinkOpenPlatform.prototype, "_keepAliveServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", CADownloadServer_1.CADownloadServer)
], AppReolinkOpenPlatform.prototype, "_caDownloadServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceCertServer_1.DeviceCertServer)
], AppReolinkOpenPlatform.prototype, "_deviceCertServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", RTSPServer_1.RTSPServer)
], AppReolinkOpenPlatform.prototype, "_rtspServer", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", CertManager_1.CertManager)
], AppReolinkOpenPlatform.prototype, "_certManager", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", SchedulerRunner_1.SchedulerRunner)
], AppReolinkOpenPlatform.prototype, "_schedulerRunner", void 0);
AppReolinkOpenPlatform = __decorate([
    app.AppSchema({
        type: 'app',
        name: 'ReolinkOpenPlatform',
    })
], AppReolinkOpenPlatform);
_.Async.invokeAsync(async () => {
    const exe = new app.Executor(AppReolinkOpenPlatform, {
        appRoot: `${__dirname}/..`,
    });
    process.exit(await exe.execute(process.argv));
});
//# sourceMappingURL=app.js.map