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
exports.CertManager = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Config = __importStar(require("#fx/config"));
const Logs = __importStar(require("#fx/log"));
const CertFactory_1 = require("../core/CertFactory");
const fs = __importStar(require("fs"));
let CertManager = class CertManager {
    checkServerCertTimeout() {
        const timeGap = Date.now() - this._serverCertRenewAt;
        if (timeGap > (this._certCfg.serverCertValidDays - 7) * U.DateTime.MS_PER_DAY) {
            return true;
        }
        return false;
    }
    getRootCACert() {
        if (!this._ca) {
            const path = this.getRootCACertPath();
            this._ca = fs.readFileSync(path).toString();
        }
        return this._ca;
    }
    getRootCACertPath() {
        const rootCADir = `${this._certCfg.workDir}/ECC/Root`;
        const rootCertPath = `${rootCADir}/ca.pem`;
        return rootCertPath;
    }
    getClientCertValidDays() {
        return this._certCfg.clientCertValidDays;
    }
    async createClientCert(uid) {
        const rootCADir = `${this._certCfg.workDir}/ECC/Root`;
        const rootCertPath = `${rootCADir}/ca.pem`;
        const workDir = this._certCfg.workDir;
        const host = this._serverHost;
        const l2CADir = `${this._certCfg.workDir}/ECC/E1`;
        const l2CACertPath = `${l2CADir}/ca.pem`;
        const clientKeyPath = `${l2CADir}/private/client-${uid}.key.pem`;
        const clientFullchainPath = `${l2CADir}/newcerts/client-${uid}.fullchain.pem`;
        await this._certFactory.createClientCert({
            host,
            rootCADir,
            rootCertPath,
            workDir,
            l2CADir,
            l2CACertPath,
            'validDays': this._certCfg.clientCertValidDays,
            clientKeyPath,
            clientFullchainPath,
            uid
        });
        this._logs.info({
            'action': 'createClientCert',
            'message': 'ok'
        });
        return {
            'cert': clientFullchainPath,
            'ca': rootCertPath,
            'key': clientKeyPath
        };
    }
    async renewServerCert() {
        const rootCADir = `${this._certCfg.workDir}/ECC/Root`;
        const rootCertPath = `${rootCADir}/ca.pem`;
        const workDir = this._certCfg.workDir;
        const host = this._serverHost;
        const l2CADir = `${this._certCfg.workDir}/ECC/E1`;
        const l2CACertPath = `${l2CADir}/ca.pem`;
        const serverKeyPath = `${l2CADir}/private/server-${host}.key.pem`;
        const serverFullchainPath = `${l2CADir}/newcerts/server-${host}.fullchain.pem`;
        let altNames = `DNS.1 = ${host}`;
        if (U.Network.isIPv4Address(altNames)) {
            altNames = `IP.1 = ${host}`;
        }
        const endDate = Date.now() + this._certCfg.serverCertValidDays * U.DateTime.MS_PER_DAY;
        const startDate = Date.now() - this._certCfg.serverCertValidDaysBefore * U.DateTime.MS_PER_DAY;
        await this._certFactory.createServerCert({
            host,
            rootCADir,
            rootCertPath,
            workDir,
            l2CADir,
            l2CACertPath,
            'startDate': new Date(startDate).toISOString().split('.')[0].replace(/[-T:]/g, '').slice(-12) + 'Z',
            'endDate': new Date(endDate).toISOString().split('.')[0].replace(/[-T:]/g, '').slice(-12) + 'Z',
            serverKeyPath,
            serverFullchainPath,
            altNames
        });
        this._logs.info({
            'action': 'createServerCert',
            'message': 'ok'
        });
        this._serverCertRenewAt = Date.now();
        return {
            'cert': serverFullchainPath,
            'ca': rootCertPath,
            'key': serverKeyPath
        };
    }
    async initServerCert() {
        const rootCADir = `${this._certCfg.workDir}/ECC/Root`;
        const rootCertPath = `${rootCADir}/ca.pem`;
        const workDir = this._certCfg.workDir;
        const host = this._serverHost;
        const l2CADir = `${this._certCfg.workDir}/ECC/E1`;
        const l2CACertPath = `${l2CADir}/ca.pem`;
        if (!fs.existsSync(`${rootCADir}/ca.cnf`)) {
            await this._certFactory.createRootCA({
                host,
                rootCADir,
                rootCertPath,
                workDir
            });
            this._logs.info({
                'action': 'createRootCA',
                'message': 'ok'
            });
        }
        if (!fs.existsSync(`${l2CADir}/ca.cnf`)) {
            await this._certFactory.createL2CA({
                host,
                rootCADir,
                rootCertPath,
                workDir,
                l2CADir,
                l2CACertPath
            });
            this._logs.info({
                'action': 'createL2CA',
                'message': 'ok'
            });
        }
        return this.renewServerCert();
    }
};
__decorate([
    Config.BindConfig({
        'path': 'cert',
        'defaultValue': {
            'workDir': '/data/certs',
            'serverCertValidDays': 90,
            'serverCertValidDaysBefore': 30,
            'clientCertValidDays': 180
        }
    }),
    __metadata("design:type", Object)
], CertManager.prototype, "_certCfg", void 0);
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], CertManager.prototype, "_logs", void 0);
__decorate([
    Config.BindConfig({
        'path': 'serverHost',
        'validation': 'string(1,255)'
    }),
    __metadata("design:type", String)
], CertManager.prototype, "_serverHost", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", CertFactory_1.CertFactory)
], CertManager.prototype, "_certFactory", void 0);
CertManager = __decorate([
    DI.Singleton()
], CertManager);
exports.CertManager = CertManager;
//# sourceMappingURL=CertManager.js.map