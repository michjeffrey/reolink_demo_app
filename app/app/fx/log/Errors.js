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
exports.E_APP_ID_REQUIRED = exports.E_LOG_DRIVER_TYPE_NOT_SUPPORTED = exports.E_LOG_SUBJECT_REQUIRED = exports.exceptionRegistry = void 0;
const $Exceptions = __importStar(require("@litert/exception"));
exports.exceptionRegistry = $Exceptions.createExceptionRegistry({
    'module': 'logs.libs.reolink.com',
    'types': {
        'log': {
            index: $Exceptions.createIncreaseCodeIndex(0x100000000)
        }
    }
});
exports.E_LOG_SUBJECT_REQUIRED = exports.exceptionRegistry.register({
    name: 'log_subject_required',
    message: 'The subject is required for a logger.',
    metadata: {},
    type: 'log'
});
exports.E_LOG_DRIVER_TYPE_NOT_SUPPORTED = exports.exceptionRegistry.register({
    name: 'log_driver_type_not_supported',
    message: 'The type of driver is not supported yet.',
    metadata: {},
    type: 'log'
});
exports.E_APP_ID_REQUIRED = exports.exceptionRegistry.register({
    name: 'app_id_required',
    message: 'The instance identity of application is required.',
    metadata: {},
    type: 'log'
});
//# sourceMappingURL=Errors.js.map