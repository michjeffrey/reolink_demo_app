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
exports.E_DUPLICATE_FIRMWARE = exports.E_SNAP_ERROR = exports.E_DUPLICATE_SNAP = exports.E_FILE_NAME_INVALID = exports.E_DUPLICATE_UPGRADE = exports.E_UP_TO_UPGRADE_SESSION_LIMIT = exports.E_URL_NOT_FOUND = exports.E_SESSION_EXIPIRED = exports.E_SESSION_NOT_FOUND = exports.E_INVALID_PARAMETER = void 0;
const $Exception = __importStar(require("@litert/exception"));
const registry = $Exception.createExceptionRegistry({
    module: 'exception.open.reolink.platform',
    types: {
        'client': {
            index: $Exception.createDecreaseCodeIndex(-1)
        }
    }
});
exports.E_INVALID_PARAMETER = registry.register({
    type: 'client',
    name: 'invalid_parameter',
    message: 'The parameter is not valid.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_SESSION_NOT_FOUND = registry.register({
    type: 'client',
    name: 'session_not_found',
    message: 'The session is not been found.',
    metadata: {
        'statusCode': 404
    }
});
exports.E_SESSION_EXIPIRED = registry.register({
    type: 'client',
    name: 'session_expired',
    message: 'The session is expired.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_URL_NOT_FOUND = registry.register({
    type: 'client',
    name: 'url_not_found',
    message: 'The url is not been found.',
    metadata: {
        'statusCode': 404
    }
});
exports.E_UP_TO_UPGRADE_SESSION_LIMIT = registry.register({
    type: 'client',
    name: 'up_to_upgrade_session_limit',
    message: 'up to upgrade session limit.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_DUPLICATE_UPGRADE = registry.register({
    type: 'client',
    name: 'duplicate_upgrade',
    message: 'the device is upgrading now, do not upgrade again.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_FILE_NAME_INVALID = registry.register({
    type: 'client',
    name: 'invalid_filename',
    message: 'the filename is not valid.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_DUPLICATE_SNAP = registry.register({
    type: 'client',
    name: 'duplicate_snap',
    message: 'the device is snaping now, do not snap again.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_SNAP_ERROR = registry.register({
    type: 'client',
    name: 'snap_error',
    message: 'snap the picture error, please try again.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_DUPLICATE_FIRMWARE = registry.register({
    type: 'client',
    name: 'duplicate_firmware',
    message: 'the fireware is the same as before.',
    metadata: {
        'statusCode': 400
    }
});
//# sourceMappingURL=client.js.map