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
exports.UseManager = exports.getManager = exports.getConfigAccessor = exports.UseConfigAccessor = exports.fetchConfig = exports.useConfig = exports.BindConfig = void 0;
const DI = __importStar(require("#fx/di"));
const C = __importStar(require("./Common"));
const I = __importStar(require("./Internal"));
const Manager_1 = require("./Manager");
function BindConfig(opts) {
    return DI.Inject('', { tag: I.mkNsTag(opts.ns ?? C.DEFAULT_CONFIG_NS), context: { opts } });
}
exports.BindConfig = BindConfig;
function useConfig(opts) {
    return DI.use('', { tag: I.mkNsTag(opts.ns ?? C.DEFAULT_CONFIG_NS), context: { opts } });
}
exports.useConfig = useConfig;
function fetchConfig(container, opts) {
    return container.resolve('', { tag: I.mkNsTag(opts.ns ?? C.DEFAULT_CONFIG_NS), context: { opts } });
}
exports.fetchConfig = fetchConfig;
function UseConfigAccessor(configNS = C.DEFAULT_CONFIG_NS) {
    return DI.Inject(I.mkNsTag(configNS));
}
exports.UseConfigAccessor = UseConfigAccessor;
function getConfigAccessor(container, configNS = C.DEFAULT_CONFIG_NS) {
    return container.resolve(I.mkNsTag(configNS));
}
exports.getConfigAccessor = getConfigAccessor;
function getManager(ctr) {
    return ctr.resolve(Manager_1.ConfigManager);
}
exports.getManager = getManager;
function UseManager() {
    return DI.Inject(Manager_1.ConfigManager);
}
exports.UseManager = UseManager;
//# sourceMappingURL=Decorators.js.map