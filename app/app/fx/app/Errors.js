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
exports.E_PERMISSION_DENIED = exports.E_APP_ENTRY_NOT_FOUND = exports.E_INVALID_APP_NAME = exports.exceptionRegistry = void 0;
const $Exceptions = __importStar(require("@litert/exception"));
exports.exceptionRegistry = $Exceptions.createExceptionRegistry({
    'module': 'app.libs.reolink.com',
    'types': {
        'fx': {
            index: $Exceptions.createIncreaseCodeIndex(0x10000000)
        },
        'project': {
            index: $Exceptions.createIncreaseCodeIndex(0x10001000)
        }
    }
});
exports.E_INVALID_APP_NAME = exports.exceptionRegistry.register({
    'name': 'invalid_app_name',
    'message': 'The given name of App is malformed.',
    'metadata': {},
    'type': 'project'
});
exports.E_APP_ENTRY_NOT_FOUND = exports.exceptionRegistry.register({
    'name': 'app_entry_not_found',
    'message': 'The entry program of application does not exist.',
    'metadata': {},
    'type': 'project'
});
exports.E_PERMISSION_DENIED = exports.exceptionRegistry.register({
    'name': 'permission_denied',
    'message': 'The operation is denied by permission.',
    'metadata': {},
    'type': 'project'
});
//# sourceMappingURL=Errors.js.map