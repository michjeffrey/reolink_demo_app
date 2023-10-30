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
exports.getAppRoot = exports.useAppRoot = exports.UseAppRoot = exports.getAppDebugMode = exports.useAppDebugMode = exports.UseAppDebugMode = exports.getAppId = exports.useAppId = exports.UseAppId = exports.getAppType = exports.useAppType = exports.UseAppType = exports.getAppName = exports.useAppName = exports.UseAppName = exports.DI_TOKEN_APP_DEBUG_MODE = exports.DI_TOKEN_APP_TYPE = exports.DI_TOKEN_APP_ID = exports.DI_TOKEN_APP_ROOT = exports.DI_TOKEN_APP_NAME = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const E = __importStar(require("./Errors"));
exports.DI_TOKEN_APP_NAME = 'app.name';
exports.DI_TOKEN_APP_ROOT = 'app.root';
exports.DI_TOKEN_APP_ID = 'app.id';
exports.DI_TOKEN_APP_TYPE = 'app.type';
exports.DI_TOKEN_APP_DEBUG_MODE = 'app.debug';
function UseAppName() {
    return DI.Inject(exports.DI_TOKEN_APP_NAME);
}
exports.UseAppName = UseAppName;
function useAppName() {
    return DI.use(exports.DI_TOKEN_APP_NAME);
}
exports.useAppName = useAppName;
function getAppName(ctr) {
    return ctr.resolve(exports.DI_TOKEN_APP_NAME);
}
exports.getAppName = getAppName;
function UseAppType() {
    return DI.Inject(exports.DI_TOKEN_APP_TYPE);
}
exports.UseAppType = UseAppType;
function useAppType() {
    return DI.use(exports.DI_TOKEN_APP_TYPE);
}
exports.useAppType = useAppType;
function getAppType(ctr) {
    return ctr.resolve(exports.DI_TOKEN_APP_TYPE);
}
exports.getAppType = getAppType;
function UseAppId() {
    return DI.Inject(exports.DI_TOKEN_APP_ID, {
        'name': 'app.id',
        'initializer': init
    });
}
exports.UseAppId = UseAppId;
function useAppId() {
    return DI.use(exports.DI_TOKEN_APP_ID, {
        'name': 'app.id',
        'initializer': init
    });
}
exports.useAppId = useAppId;
function getAppId(ctr) {
    return ctr.resolve(exports.DI_TOKEN_APP_ID, {
        'name': 'app.id',
        'initializer': init
    });
}
exports.getAppId = getAppId;
function UseAppDebugMode() {
    return DI.Inject(exports.DI_TOKEN_APP_DEBUG_MODE);
}
exports.UseAppDebugMode = UseAppDebugMode;
function useAppDebugMode() {
    return DI.use(exports.DI_TOKEN_APP_DEBUG_MODE);
}
exports.useAppDebugMode = useAppDebugMode;
function getAppDebugMode(ctr) {
    return ctr.resolve(exports.DI_TOKEN_APP_DEBUG_MODE);
}
exports.getAppDebugMode = getAppDebugMode;
function UseAppRoot() {
    return DI.Inject(exports.DI_TOKEN_APP_ROOT);
}
exports.UseAppRoot = UseAppRoot;
function useAppRoot() {
    return DI.use(exports.DI_TOKEN_APP_ROOT);
}
exports.useAppRoot = useAppRoot;
function getAppRoot(ctr) {
    return ctr.resolve(exports.DI_TOKEN_APP_ROOT);
}
exports.getAppRoot = getAppRoot;
function isGUID(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
function init(ctr) {
    ctr.bindProducer(exports.DI_TOKEN_APP_ID, async (ctr) => {
        let ret;
        if (process.env.REOLINK_APP_ID) {
            ret = process.env.REOLINK_APP_ID;
        }
        else {
            const cfgMgr = await Config.getManager(ctr);
            ret = cfgMgr.fetch({
                'validation': 'string',
                'path': 'application.instanceId'
            });
        }
        if (typeof ret !== 'string' || !isGUID(ret)) {
            throw new E.E_APP_ID_REQUIRED({ 'id': ret });
        }
        return ret;
    });
}
//# sourceMappingURL=APIs.js.map