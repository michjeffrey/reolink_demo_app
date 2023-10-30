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
exports.E_HTTP_FAILED = exports.E_FILE_INACCESSIBLE = exports.E_MALFORMED_JSON_FILE = exports.E_EXCEEDED_RETRYABLE_TIMES = exports.E_CASE_STYLE_NOT_SUPPORT = exports.E_SLEEP_ABORTED = exports.E_INVALID_ENUM = exports.exceptionRegistry = void 0;
const $Exception = __importStar(require("@litert/exception"));
exports.exceptionRegistry = $Exception.createExceptionRegistry({
    module: 'utils.libs.reolink.com',
    types: {
        'utils': {
            index: $Exception.createIncreaseCodeIndex(0x100000000)
        }
    }
});
exports.E_INVALID_ENUM = exports.exceptionRegistry.register({
    name: 'invalid_enum',
    message: 'The type of enum is invalid.',
    metadata: {},
    type: 'utils'
});
exports.E_SLEEP_ABORTED = exports.exceptionRegistry.register({
    name: 'sleep_aborted',
    message: 'The sleep has been aborted.',
    metadata: {},
    type: 'utils'
});
exports.E_CASE_STYLE_NOT_SUPPORT = exports.exceptionRegistry.register({
    name: 'case_style_not_support',
    message: 'The style of identity casing can not be handled.',
    metadata: {},
    type: 'utils'
});
exports.E_EXCEEDED_RETRYABLE_TIMES = exports.exceptionRegistry.register({
    name: 'exceeded_retryable_times',
    message: 'Exceeded the maximum times of retry.',
    metadata: {},
    type: 'utils'
});
exports.E_MALFORMED_JSON_FILE = exports.exceptionRegistry.register({
    name: 'malformed_json_file',
    message: 'The JSON file to be read is malformed.',
    metadata: {},
    type: 'utils'
});
exports.E_FILE_INACCESSIBLE = exports.exceptionRegistry.register({
    name: 'file_inaccessible',
    message: 'Can not access determined file.',
    metadata: {},
    type: 'utils'
});
exports.E_HTTP_FAILED = exports.exceptionRegistry.register({
    name: 'http_failed',
    message: 'Failed to request by HTTP protocol.',
    metadata: {},
    type: 'utils'
});
//# sourceMappingURL=Defs.js.map