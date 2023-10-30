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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const decorator_1 = __importDefault(require("@litert/decorator"));
const reflect_1 = __importDefault(require("@litert/reflect"));
const DI = __importStar(require("#fx/di"));
const B = __importStar(require("#fx/app.basic"));
const _ = __importStar(require("#fx/utils"));
const C = __importStar(require("./Common"));
const I = __importStar(require("./Internal"));
const E = __importStar(require("./Errors"));
class Executor {
    constructor(_appCtor, _opts, _container = new DI.Container()) {
        this._appCtor = _appCtor;
        this._opts = _opts;
        this._container = _container;
        const schemaOpts = reflect_1.default.getClassMetadata(this._appCtor, I.META_APP_OPTIONS);
        if (!schemaOpts) {
            throw new E.E_APP_ENTRY_NOT_FOUND({ class: this._appCtor.name });
        }
        this.type = schemaOpts.type;
        this.name = schemaOpts.name;
    }
    async execute(args) {
        this._container.bindValue(B.DI_TOKEN_APP_DEBUG_MODE, this._opts.debug ?? process.env['REOLINK_DEBUG_MODE'] === '1');
        this._container.bindValue(B.DI_TOKEN_APP_TYPE, this.type);
        this._container.bindValue(B.DI_TOKEN_APP_NAME, this.name);
        process.title = `reolink-${this.type}/${this.name}`;
        if (!_.Object.isInheritedFrom(this._appCtor, C.AbstractApplication)) {
            throw new E.E_APP_ENTRY_NOT_FOUND({ class: this._appCtor.name });
        }
        if (this._opts.changeToAppRoot) {
            process.chdir(this._opts.appRoot);
        }
        if (this._opts.appRoot) {
            module.paths.unshift(`${this._opts.appRoot}/node_modules`);
        }
        this._container.bindValue(B.DI_TOKEN_APP_ROOT, this._opts.appRoot);
        let ret = -1;
        try {
            if (this._appCtor.onInit) {
                await this._appCtor.onInit(this._container);
            }
            await this._callSetupHook(this._appCtor);
            const app = await this._container.resolve(this._appCtor);
            ret = await app.main(args);
            if (this._appCtor.onUninit) {
                await this._appCtor.onUninit(this._container);
            }
        }
        catch (e) {
            console.error(JSON.stringify(_.Errors.errorToJson(e), null, 2));
            if (this._opts.debug) {
                debugger;
            }
        }
        return ret;
    }
    async _callSetupHook(appCtor) {
        if (!appCtor.setup) {
            return;
        }
        const fns = [];
        while (_.Object.isInheritedFrom(appCtor, C.AbstractApplication)) {
            if (!appCtor.setup) {
                break;
            }
            if (fns[0]?.setupFn !== appCtor.setup) {
                fns.unshift({ ctor: appCtor, setupFn: appCtor.setup });
            }
            else {
                fns[0].ctor = appCtor;
            }
            appCtor = decorator_1.default.getParentClass(appCtor);
        }
        for (const i of fns) {
            const result = i.setupFn.apply(i.ctor, [this._container]);
            if (result instanceof Promise) {
                await result;
            }
        }
    }
}
exports.Executor = Executor;
//# sourceMappingURL=Executor.js.map