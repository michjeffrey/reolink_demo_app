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
exports.E_DUPLICATE_CREATE_CA = exports.E_WORK_DIR_NOT_FOUND = exports.E_SERVER_INTERNAL_ERROR = void 0;
const $Exception = __importStar(require("@litert/exception"));
const registry = $Exception.createExceptionRegistry({
    module: 'exception.open.reolink.platform',
    types: {
        'server': {
            index: $Exception.createDecreaseCodeIndex(-1)
        }
    }
});
exports.E_SERVER_INTERNAL_ERROR = registry.register({
    type: 'server',
    name: 'server_internal_error',
    message: 'something unkown happend in the system.',
    metadata: {
        'statusCode': 500
    }
});
exports.E_WORK_DIR_NOT_FOUND = registry.register({
    type: 'server',
    name: 'work_dir_not_found',
    message: 'the work directory is not been found.',
    metadata: {
        'statusCode': 500
    }
});
exports.E_DUPLICATE_CREATE_CA = registry.register({
    type: 'server',
    name: 'duplicate_create_ca',
    message: 'duplicate create ca.',
    metadata: {
        'statusCode': 500
    }
});
//# sourceMappingURL=server.js.map