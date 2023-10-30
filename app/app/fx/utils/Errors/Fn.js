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
exports.isNetworkError = exports.errorToJson = void 0;
const $Exception = __importStar(require("@litert/exception"));
function errorToJson(e) {
    switch (typeof e) {
        case 'bigint':
        case 'number':
            return {
                code: e.toString(),
                symbol: 'integer',
                message: 'unknown',
                stack: 'unknown',
            };
        case 'boolean':
            return {
                code: e ? 1 : 0,
                symbol: 'boolean',
                message: 'unknown',
                stack: 'unknown',
            };
        case 'string':
            return {
                code: 'unknown',
                symbol: 'string',
                message: e,
                stack: 'unknown',
            };
        case 'symbol':
            return {
                code: 'unknown',
                symbol: 'symbol',
                message: e.description,
                stack: 'unknown',
            };
        default:
            if (e === null || e === undefined) {
                e = {};
            }
            if (e?.__proto__?.constructor?.name === 'QueryFailedError') {
                return {
                    symbol: e.code,
                    code: e.errno,
                    message: e.message,
                    query: {
                        sql: e.query,
                        params: e.parameters,
                    },
                    stack: e.stack ?? e.trace,
                };
            }
            if ($Exception.identify(e)) {
                return {
                    'code': e.code,
                    'symbol': e.name,
                    'message': e.message,
                    'meta': e.metadata,
                    'stack': e.stack,
                };
            }
            return {
                code: e?.errno ?? e?.code ?? e?.name ?? -1,
                symbol: e?.name ?? 'unknown',
                message: e?.message ?? e?.msg ?? 'unknown',
                stack: e?.stack ?? e?.trace ?? 'unknown',
            };
    }
}
exports.errorToJson = errorToJson;
const NETWORK_ERRORS = {
    'ECONNRESET': true,
    'ECONNREFUSED': true,
    'ENOTFOUND': true,
    'ETIMEDOUT': true,
    'EPIPE': true,
    'ECONNABORTED': true,
};
function isNetworkError(e) {
    return NETWORK_ERRORS[e?.code ?? ''];
}
exports.isNetworkError = isNetworkError;
//# sourceMappingURL=Fn.js.map