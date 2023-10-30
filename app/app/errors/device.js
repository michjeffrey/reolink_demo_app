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
exports.E_DIRECTION_NOT_SUPPORT = exports.E_CMD_EXEC_ERROR = exports.E_CMD_NOT_SUPPORT = exports.E_ACCESS_KEY_NOT_VALID = exports.E_WAKE_UP_TIMEOUT = exports.E_CMD_TIMEOUT = exports.E_SIGNATURE_NOT_MATCHED = exports.E_FILE_NOT_FOUND = exports.E_PARSE_XML_ERROR = exports.E_REQUEST_NOT_FOUND = exports.E_DEVICE_NOT_MATCHED = exports.E_DEVICE_CHANNEL_NOT_FOUND = exports.E_DEVICE_CONNECTION_NOT_FOUND = exports.E_INVALID_CODE = exports.E_DEVICE_SIGNALING_CLOSED = exports.E_STREAM_TYPE_NOT_SUPPORT = exports.E_DEVICE_OFFLINE = void 0;
const $Exception = __importStar(require("@litert/exception"));
const registry = $Exception.createExceptionRegistry({
    module: 'exception.open.reolink.platform',
    types: {
        'device': {
            index: $Exception.createDecreaseCodeIndex(-1)
        }
    }
});
exports.E_DEVICE_OFFLINE = registry.register({
    type: 'device',
    name: 'device_offline',
    message: 'The device is offline, please check the device network.',
    metadata: {
        'statusCode': 404
    }
});
exports.E_STREAM_TYPE_NOT_SUPPORT = registry.register({
    type: 'device',
    name: 'stream_type_not_support',
    message: 'The stream type is not suport on this device.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_DEVICE_SIGNALING_CLOSED = registry.register({
    type: 'device',
    name: 'device_signaling_connection_closed',
    message: 'The device signaling connection closed.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_INVALID_CODE = registry.register({
    type: 'device',
    name: 'code_invalid',
    message: 'The code is invalid.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_DEVICE_CONNECTION_NOT_FOUND = registry.register({
    type: 'device',
    name: 'device_connection_not_found',
    message: 'The device connnection is not found.',
    metadata: {
        'statusCode': 404
    }
});
exports.E_DEVICE_CHANNEL_NOT_FOUND = registry.register({
    type: 'device',
    name: 'device_channel_not_found',
    message: 'The channel of the device  is not found.',
    metadata: {
        'statusCode': 404
    }
});
exports.E_DEVICE_NOT_MATCHED = registry.register({
    type: 'device',
    name: 'device_not_matched',
    message: 'The device is not matched.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_REQUEST_NOT_FOUND = registry.register({
    type: 'device',
    name: 'request_not_found',
    message: 'The request is not found.',
    metadata: {
        'statusCode': 404
    }
});
exports.E_PARSE_XML_ERROR = registry.register({
    type: 'device',
    name: 'parse_xml_error',
    message: 'The xml data from device is error.',
    metadata: {
        'statusCode': 404
    }
});
exports.E_FILE_NOT_FOUND = registry.register({
    type: 'device',
    name: 'file_not_found',
    message: 'The file is not been found.',
    metadata: {
        'statusCode': 404
    }
});
exports.E_SIGNATURE_NOT_MATCHED = registry.register({
    type: 'device',
    name: 'signature_not_matched',
    message: 'The signature is not matched.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_CMD_TIMEOUT = registry.register({
    type: 'device',
    name: 'cmd_timeout',
    message: 'The cmd to device execute time out.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_WAKE_UP_TIMEOUT = registry.register({
    type: 'device',
    name: 'wake_up_timeout',
    message: 'The cmd to wake up device time out.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_ACCESS_KEY_NOT_VALID = registry.register({
    type: 'device',
    name: 'access_key_not_valid',
    message: 'The accessKey is not valid.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_CMD_NOT_SUPPORT = registry.register({
    type: 'device',
    name: 'cmd_not_support',
    message: 'The cmd is not support for the device.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_CMD_EXEC_ERROR = registry.register({
    type: 'device',
    name: 'cmd_exec_error',
    message: 'The cmd is exec error.',
    metadata: {
        'statusCode': 400
    }
});
exports.E_DIRECTION_NOT_SUPPORT = registry.register({
    type: 'device',
    name: 'direction_not_support',
    message: 'The direction is not support for the device.',
    metadata: {
        'statusCode': 400
    }
});
//# sourceMappingURL=device.js.map