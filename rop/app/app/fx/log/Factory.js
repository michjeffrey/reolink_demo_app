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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerFactory = void 0;
const Logger = __importStar(require("@litert/logger"));
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const AppBasic = __importStar(require("#fx/app.basic"));
const E = __importStar(require("./Errors"));
const I = __importStar(require("./Internal"));
const DEFAULT_SUBJECT_CONFIG_PATH = I.makeSubjectConfigPath('default');
const DEFAULT_SUBJECT_CONFIG = {
    enabled: true,
    levels: I.VALID_LEVELS,
    driver: 'default'
};
const DEFAULT_DRIVER_CONFIG = {
    type: 'console'
};
function createLogFormatter(appId) {
    return function (log, subject, level, date, traces) {
        return JSON.stringify({
            subject,
            level,
            date: date.getTime(),
            appId,
            log,
            traces
        });
    };
}
let LoggerFactory = class LoggerFactory extends DI.AbstractFactory {
    async create(opts, _target, ctr) {
        if (!opts.context?.subject) {
            throw new E.E_LOG_SUBJECT_REQUIRED();
        }
        const cfgMgr = await Config.getManager(ctr);
        const config = cfgMgr.fetch({
            'path': I.makeSubjectConfigPath(opts.context.subject),
            'ns': opts.context.configNS,
            'defaultValue': () => cfgMgr.fetch({
                'path': DEFAULT_SUBJECT_CONFIG_PATH,
                'ns': opts.context.configNS,
                'defaultValue': DEFAULT_SUBJECT_CONFIG
            })
        });
        const appId = await AppBasic.getAppId(ctr);
        if (!I.LOG_FACTORY.getDriverNames().includes(config.driver ?? 'default')) {
            await this._registerDriver(config.driver ?? 'default', ctr, opts.context.configNS);
        }
        const ret = I.LOG_FACTORY.createDataLogger(opts.context.subject, config.pretty ? 'pretty_text' : createLogFormatter(appId), config.driver);
        if (config.enabled ?? true) {
            if (!config.levels?.length) {
                ret.unmute();
            }
            else {
                ret.unmute(config.levels.filter((v) => I.VALID_LEVELS.includes(v)));
            }
        }
        else {
            ret.mute();
        }
        return ret;
    }
    async _registerDriver(name, ctr, configNS) {
        const cfgMgr = await Config.getManager(ctr);
        const config = cfgMgr.fetch({
            path: I.makeDriverConfigPath(name),
            ns: configNS,
            defaultValue: DEFAULT_DRIVER_CONFIG
        });
        if (config.type === 'console') {
            I.LOG_FACTORY.registerDriver(name, Logger.createConsoleDriver());
            return;
        }
        let driverFactory = {};
        try {
            driverFactory = require(`#fx/log.driver.${config.type}`);
        }
        catch {
            throw new E.E_LOG_DRIVER_TYPE_NOT_SUPPORTED({ name, config });
        }
        if (typeof driverFactory.createLogDriver !== 'function') {
            throw new E.E_LOG_DRIVER_TYPE_NOT_SUPPORTED({ name, config });
        }
        I.LOG_FACTORY.registerDriver(name, await driverFactory.createLogDriver(ctr, await AppBasic.getAppName(ctr), await AppBasic.getAppId(ctr), config, configNS));
    }
};
LoggerFactory = __decorate([
    DI.Factory(I.LOGGER_DI_TYPE),
    DI.Singleton()
], LoggerFactory);
exports.LoggerFactory = LoggerFactory;
//# sourceMappingURL=Factory.js.map