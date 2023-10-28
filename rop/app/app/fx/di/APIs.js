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
exports.useContainer = exports.UseContainer = exports.Type = exports.Factory = exports.Uninitializer = exports.Initializer = exports.Singleton = exports.AutoInject = exports.Inject = exports.use = void 0;
const C = __importStar(require("./Common"));
const I = __importStar(require("./Internal"));
const E = __importStar(require("./Errors"));
const _ = __importStar(require("#fx/utils"));
const decorator_1 = __importDefault(require("@litert/decorator"));
const reflect_1 = __importDefault(require("@litert/reflect"));
const ClassRegistry_1 = require("./ClassRegistry");
const Container_1 = require("./Container");
function getClassInjectionInfo(ctor) {
    let ci = reflect_1.default.getClassMetadata(ctor, I.META_INJECTION);
    if (!ci) {
        ci = new I.ClassInjectionInfo();
        reflect_1.default.setClassMetadata(ctor, I.META_INJECTION, ci);
    }
    return ci;
}
const use = (token, opts) => {
    return new I.WaitForInjection(token, opts);
};
exports.use = use;
function Inject(token, opts) {
    return decorator_1.default.createGeneralDecorator({
        ctorParameter(ctor, index) {
            const ci = getClassInjectionInfo(ctor);
            if (ci.ctorInjections[index] !== undefined) {
                throw new E.E_REDEFINE_INJECTION({
                    class: ctor.name,
                    position: 'ctor_param',
                    index
                });
            }
            if (undefined === token) {
                const t = reflect_1.default.getConstructorParameterTypes(ctor)?.[index];
                if (I.isBuiltInType(t)) {
                    throw new E.E_UNCLEAR_INJECTION({
                        class: ctor.name,
                        position: 'ctor_param',
                        index,
                        type: t
                    });
                }
                token = t;
            }
            while (ci.ctorInjections.length < index + 1) {
                ci.ctorInjections.push(undefined);
            }
            ci.ctorInjections[index] = new I.Injection(token, opts);
        },
        property(proto, name) {
            const clsCtor = _.Object.getClassOfObject(proto);
            const ci = getClassInjectionInfo(clsCtor);
            if (ci.propInjections[name]) {
                throw new E.E_REDEFINE_INJECTION({
                    class: clsCtor.name,
                    position: 'property',
                    index: name
                });
            }
            if (undefined === token) {
                const t = reflect_1.default.getPropertyType(clsCtor, name);
                if (I.isBuiltInType(t)) {
                    throw new E.E_UNCLEAR_INJECTION({
                        class: clsCtor.name,
                        position: 'property',
                        property: name,
                        type: t
                    });
                }
                token = t;
            }
            ci.propInjections[name] = new I.Injection(token, opts);
        }
    });
}
exports.Inject = Inject;
function AutoInject() {
    return reflect_1.default.createClassMetadataDecorator('auto-inject', true);
}
exports.AutoInject = AutoInject;
function Singleton() {
    return decorator_1.default.createClassDecorator((ctor) => {
        reflect_1.default.setClassMetadata(ctor, I.META_SINGLETON, true);
    });
}
exports.Singleton = Singleton;
function Initializer() {
    return reflect_1.default.createMethodMetadataDecorator(I.META_INIT, true);
}
exports.Initializer = Initializer;
function Uninitializer() {
    return reflect_1.default.createMethodMetadataDecorator(I.META_UNINIT, true);
}
exports.Uninitializer = Uninitializer;
function Factory(target) {
    return decorator_1.default.createClassDecorator((ctor) => {
        if (!_.Object.isInheritedFrom(ctor, C.AbstractFactory)) {
            throw new E.E_INVALID_FACTORY({ class: ctor.name });
        }
        if (reflect_1.default.getClassMetadata(ctor, I.META_FACTORY)) {
            throw new E.E_REDEFINE_FACTORY({ class: ctor.name, target });
        }
        reflect_1.default.setClassMetadata(ctor, I.META_FACTORY, target);
        (0, ClassRegistry_1.getClassRegistry)().register(ctor);
    });
}
exports.Factory = Factory;
function Type(types) {
    return decorator_1.default.createClassDecorator((ctor) => {
        const cr = (0, ClassRegistry_1.getClassRegistry)();
        for (const t of types) {
            cr.bindClassType(ctor, t);
        }
        reflect_1.default.setClassMetadata(ctor, I.META_TYPE, _.Array.uniquify([
            ...(reflect_1.default.getClassMetadata(ctor, I.META_TYPE) ?? []),
            ...types
        ]));
    });
}
exports.Type = Type;
function UseContainer(opts) {
    return Inject(Container_1.Container, opts);
}
exports.UseContainer = UseContainer;
function useContainer(opts) {
    return (0, exports.use)(Container_1.Container, opts);
}
exports.useContainer = useContainer;
//# sourceMappingURL=APIs.js.map