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
exports.E_UNSUPPORTED_FORMAT = exports.E_MALFORMED_CONFIG = exports.E_DUP_CONFIG_NAMESPACE = exports.E_NO_SUCH_NAMESPACE = exports.E_NO_SUCH_CONFIG = exports.E_READ_CONFIG_FAILED = exports.exceptionRegistry = void 0;
const $Exceptions = __importStar(require("@litert/exception"));
exports.exceptionRegistry = $Exceptions.createExceptionRegistry({
    'module': 'config.libs.reolink.com',
    'types': {
        'project': {
            index: $Exceptions.createIncreaseCodeIndex(0x10000000)
        }
    }
});
exports.E_READ_CONFIG_FAILED = exports.exceptionRegistry.register({
    'name': 'read_config_failed',
    'message': 'Can not read the configuration.',
    'metadata': {},
    'type': 'project'
});
exports.E_NO_SUCH_CONFIG = exports.exceptionRegistry.register({
    'name': 'no_such_config',
    'message': 'There is no such part of configuration.',
    'metadata': {},
    'type': 'project'
});
exports.E_NO_SUCH_NAMESPACE = exports.exceptionRegistry.register({
    'name': 'no_such_namespace',
    'message': 'No such namespace of configuration.',
    'metadata': {},
    'type': 'project'
});
exports.E_DUP_CONFIG_NAMESPACE = exports.exceptionRegistry.register({
    'name': 'dup_config_namespace',
    'message': 'The namespace of configuration already exists.',
    'metadata': {},
    'type': 'project'
});
exports.E_MALFORMED_CONFIG = exports.exceptionRegistry.register({
    'name': 'malformed_config',
    'message': 'The data of configuration is incorrect.',
    'metadata': {},
    'type': 'project'
});
exports.E_UNSUPPORTED_FORMAT = exports.exceptionRegistry.register({
    'name': 'unsupported_format',
    'message': 'The format of configuration is unsupported.',
    'metadata': {},
    'type': 'project'
});
//# sourceMappingURL=Errors.js.map