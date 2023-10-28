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
exports.makeLoggerName = exports.LOGGER_DI_TYPE = exports.makeDriverConfigPath = exports.makeSubjectConfigPath = exports.LOG_FACTORY = exports.VALID_LEVELS = void 0;
const Logger = __importStar(require("@litert/logger"));
exports.VALID_LEVELS = ['debug', 'error', 'info', 'warning'];
exports.LOG_FACTORY = Logger.createFactory(exports.VALID_LEVELS);
function makeSubjectConfigPath(subject) {
    return `logs.subjects.${subject}`;
}
exports.makeSubjectConfigPath = makeSubjectConfigPath;
function makeDriverConfigPath(name) {
    return `logs.drivers.${name}`;
}
exports.makeDriverConfigPath = makeDriverConfigPath;
exports.LOGGER_DI_TYPE = Symbol('reolink:fx:logger:logger');
exports.LOG_FACTORY.registerDataFormatter('pretty_text', function (log, s, l, d, t) {
    const msg = `[${d.toISOString()}][${s}][${l}] ${log.action}: ${log.message}`;
    if (t) {
        return [msg, ...t.map((l) => `  ${l}`)].join('\n');
    }
    return msg;
});
exports.LOG_FACTORY.registerDriver('console', Logger.createConsoleDriver());
function makeLoggerName(subject, config) {
    return `reolink:fx:log:loggers:${config}:${subject}`;
}
exports.makeLoggerName = makeLoggerName;
//# sourceMappingURL=Internal.js.map