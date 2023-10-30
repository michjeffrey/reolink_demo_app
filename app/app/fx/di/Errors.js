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
exports.E_UNCLEAR_BIND = exports.E_REDEFINE_UNINIT_METHOD = exports.E_REDEFINE_INIT_METHOD = exports.E_NO_SOLUTION = exports.E_REDEFINE_INJECTION = exports.E_INVALID_FACTORY = exports.E_REDEFINE_FACTORY = exports.E_LACK_INJECTION = exports.E_UNCLEAR_INJECTION = exports.exceptionRegistry = void 0;
const $Exception = __importStar(require("@litert/exception"));
exports.exceptionRegistry = $Exception.createExceptionRegistry({
    module: 'inject.libs.reolink.com',
    types: {
        fx: { index: $Exception.createIncreaseCodeIndex(0x10000000) }
    }
});
exports.E_UNCLEAR_INJECTION = exports.exceptionRegistry.register({
    name: 'unclear_injection',
    message: 'The target to be injected can not be determined clearly.',
    metadata: {},
    type: 'fx'
});
exports.E_LACK_INJECTION = exports.exceptionRegistry.register({
    name: 'lack_injection',
    message: 'All required constructor parameter must be injectable in a class.',
    metadata: {},
    type: 'fx'
});
exports.E_REDEFINE_FACTORY = exports.exceptionRegistry.register({
    name: 'redefine_factory',
    message: 'Can not redefine the factory on the same class.',
    metadata: {},
    type: 'fx'
});
exports.E_INVALID_FACTORY = exports.exceptionRegistry.register({
    name: 'invalid_factory',
    message: 'The factory must inherited from class AbstractFactory.',
    metadata: {},
    type: 'fx'
});
exports.E_REDEFINE_INJECTION = exports.exceptionRegistry.register({
    name: 'redefine_injection',
    message: 'Can not redefine the injection on the same class.',
    metadata: {},
    type: 'fx'
});
exports.E_NO_SOLUTION = exports.exceptionRegistry.register({
    name: 'no_solution',
    message: 'Can not find solution for determined injection.',
    metadata: {},
    type: 'fx'
});
exports.E_REDEFINE_INIT_METHOD = exports.exceptionRegistry.register({
    name: 'multi_init_method',
    message: 'Can not redefine the initializer on the same class.',
    metadata: {},
    type: 'fx'
});
exports.E_REDEFINE_UNINIT_METHOD = exports.exceptionRegistry.register({
    name: 'multi_uninit_method',
    message: 'Can not redefine the uninitializer on the same class.',
    metadata: {},
    type: 'fx'
});
exports.E_UNCLEAR_BIND = exports.exceptionRegistry.register({
    name: 'unclear_bind',
    message: 'Can not bind an empty expression to anything.',
    metadata: {},
    type: 'fx'
});
//# sourceMappingURL=Errors.js.map