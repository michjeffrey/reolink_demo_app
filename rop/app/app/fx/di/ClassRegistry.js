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
exports.getClassRegistry = exports.ClassDescriptor = void 0;
const decorator_1 = __importDefault(require("@litert/decorator"));
const I = __importStar(require("./Internal"));
const E = __importStar(require("./Errors"));
const reflect_1 = __importDefault(require("@litert/reflect"));
class ClassDescriptor {
    get isFactory() {
        return undefined !== this.product;
    }
    constructor(ctor, ctorInjections, propInjections, product, singletonMode = false, types = [], init = '', uninit = '', parent = null) {
        this.ctor = ctor;
        this.product = product;
        this.singletonMode = singletonMode;
        this.types = types;
        this.parent = parent;
        this.hasConstructor = ctorInjections.length > 0 || ctor.toString()
            .replace(/\/\*[^\0]+?\*\//g, '')
            .replace(/\s/g, '')
            .includes('constructor(');
        this.propInjections = {
            ...this.parent?.propInjections,
            ...propInjections
        };
        this.ctorInjections = this.hasConstructor ?
            ctorInjections :
            ClassDescriptor._$getClassCtorInjections(this);
        this.init = init ? init : this.parent?.init ?? '';
        this.uninit = uninit ? uninit : this.parent?.uninit ?? '';
    }
    static _$getClassCtorInjections(dtr) {
        do {
            if (dtr.hasConstructor) {
                return dtr.ctorInjections;
            }
        } while (dtr = dtr.parent);
        return [];
    }
}
exports.ClassDescriptor = ClassDescriptor;
class ClassRegistry {
    constructor() {
        this._types2Classes = new Map();
        this._ctor2Class = new Map();
        this._factories = new Map();
    }
    findFactory(token) {
        return this._factories.get(token) ?? null;
    }
    findClassesByType(type) {
        return this._types2Classes.get(type) ?? [];
    }
    bindClassType(ctor, type) {
        const ctorList = this._types2Classes.get(type) ?? [];
        if (!ctorList.includes(ctor)) {
            ctorList.push(ctor);
        }
        this._types2Classes.set(type, ctorList);
    }
    register(ctor) {
        if (this._ctor2Class.has(ctor)) {
            return this._ctor2Class.get(ctor);
        }
        let pdtr = null;
        if (decorator_1.default.hasParentClass(ctor)) {
            pdtr = this.register(decorator_1.default.getParentClass(ctor));
        }
        let initHookName = '';
        let uninitHookName = '';
        for (const m of decorator_1.default.getOwnMethodNames(ctor)) {
            if (reflect_1.default.getMethodMetadata(ctor, m, I.META_INIT)) {
                if (initHookName) {
                    throw new E.E_REDEFINE_INIT_METHOD({ hooks: [initHookName, m] });
                }
                initHookName = m;
            }
            if (reflect_1.default.getMethodMetadata(ctor, m, I.META_UNINIT)) {
                if (uninitHookName) {
                    throw new E.E_REDEFINE_UNINIT_METHOD({ hooks: [uninitHookName, m] });
                }
                uninitHookName = m;
            }
        }
        const ci = reflect_1.default.getClassMetadata(ctor, I.META_INJECTION);
        const dtr = new ClassDescriptor(ctor, ci?.ctorInjections ?? [], ci?.propInjections ?? {}, reflect_1.default.getClassMetadata(ctor, I.META_FACTORY), reflect_1.default.getClassMetadata(ctor, I.META_SINGLETON), reflect_1.default.getClassMetadata(ctor, I.META_TYPE), initHookName, uninitHookName, pdtr);
        for (let i = 0; i < dtr.ctor.length; i++) {
            if (!(dtr.ctorInjections[i] instanceof I.Injection)) {
                const t = reflect_1.default.getConstructorParameterTypes(ctor)?.[i];
                if (t && !I.isBuiltInType(t)) {
                    dtr.ctorInjections[i] = new I.Injection(t);
                    continue;
                }
                throw new E.E_LACK_INJECTION({
                    class: ctor.name,
                    index: i
                });
            }
        }
        this._ctor2Class.set(ctor, dtr);
        if (dtr.isFactory) {
            this._factories.set(dtr.product, dtr);
        }
        return dtr;
    }
}
const gblClassRegistry = new ClassRegistry();
function getClassRegistry() {
    return gblClassRegistry;
}
exports.getClassRegistry = getClassRegistry;
//# sourceMappingURL=ClassRegistry.js.map