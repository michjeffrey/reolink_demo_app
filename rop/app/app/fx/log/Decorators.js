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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = exports.useLogger = exports.UseLogger = void 0;
const DI = __importStar(require("#fx/di"));
const I = __importStar(require("./Internal"));
const Factory_1 = require("./Factory");
const config_1 = require("#fx/config");
function init(ctr) {
    ctr.bindFactory(I.LOGGER_DI_TYPE, Factory_1.LoggerFactory);
}
function makeLoggerSln(subject, configNS = config_1.DEFAULT_CONFIG_NS) {
    return {
        context: {
            subject,
            configNS
        },
        name: I.makeLoggerName(subject, configNS),
        initializer: init,
    };
}
function UseLogger(subject, configNS) {
    return DI.Inject(I.LOGGER_DI_TYPE, makeLoggerSln(subject, configNS));
}
exports.UseLogger = UseLogger;
function useLogger(subject, configNS) {
    return DI.use(I.LOGGER_DI_TYPE, makeLoggerSln(subject, configNS));
}
exports.useLogger = useLogger;
function getLogger(ctr, subject, configNS) {
    return ctr.resolve(I.LOGGER_DI_TYPE, makeLoggerSln(subject, configNS));
}
exports.getLogger = getLogger;
//# sourceMappingURL=Decorators.js.map