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
exports.Container = void 0;
const _ = __importStar(require("#fx/utils"));
const C = __importStar(require("./Common"));
const E = __importStar(require("./Errors"));
const I = __importStar(require("./Internal"));
const ClassRegistry_1 = require("./ClassRegistry");
const PRIVILEGE_TAG = 1;
const PRIVILEGE_TOKEN = 2;
class Container {
    constructor() {
        this._singletons = new Map();
        this._namedValues = new Map();
        this._tokenSolutions = new Map();
        this._tagSolutions = new Map();
        this._doneInitializers = new Map();
        this._singletons.set(Container, this);
    }
    getClassesByType(type) {
        return (0, ClassRegistry_1.getClassRegistry)().findClassesByType(type);
    }
    _tokenToString(token) {
        switch (typeof token) {
            case 'symbol':
                return token.toString();
            case 'string':
                return token;
            case 'function':
                return token.name;
            default:
                return 'unknown';
        }
    }
    resolve(token, opts = {}) {
        if (opts.initializer && !this._doneInitializers.get(opts.initializer)) {
            opts.initializer(this);
            this._doneInitializers.set(opts.initializer, true);
        }
        if (opts.name !== undefined) {
            const namedValue = this._getNamedValues(opts.name);
            if (namedValue !== undefined) {
                return namedValue;
            }
        }
        let sln = this._getSolution(token, opts.tag);
        if (sln === null) {
            switch (typeof token) {
                case 'symbol':
                case 'string':
                    if ('defaultValue' in opts) {
                        return opts.defaultValue;
                    }
                    throw new E.E_NO_SOLUTION({ token: this._tokenToString(token), opts });
                default: {
                    const s = this._getSingleton(token);
                    if (s) {
                        return s;
                    }
                }
            }
            sln = { type: 'class', ctor: token, privilege: PRIVILEGE_TOKEN };
        }
        let ret;
        switch (sln.type) {
            case 'class':
                ret = this._resolveByCtor(sln, token);
                break;
            case 'value':
                ret = sln.value;
                break;
            case 'factory':
                ret = this._resolveByFactory(sln, token, opts);
                break;
            case 'producer':
                ret = sln.producer(this, token, opts);
                break;
        }
        if (opts.name !== undefined) {
            this._namedValues.set(opts.name, ret);
        }
        return ret;
    }
    async _resolveByFactory(sln, token, opts) {
        if (!_.Object.isInheritedFrom(sln.factory, C.AbstractFactory)) {
            throw new E.E_INVALID_FACTORY({ token: sln.factory, position: opts.position });
        }
        const factory = await this.resolve(sln.factory, { position: opts.position });
        let ret = factory.create(opts, token, this);
        if (ret instanceof Promise) {
            ret = await ret;
        }
        return ret;
    }
    async _resolveByCtor(sln, token) {
        const clsReg = (0, ClassRegistry_1.getClassRegistry)();
        const dtr = clsReg.register(sln.ctor);
        if (dtr.singletonMode) {
            const ret = this._singletons.get(sln.ctor);
            if (ret) {
                return ret;
            }
        }
        const ctorParams = [];
        for (let i = 0; i < dtr.ctorInjections.length; i++) {
            const position = `class ${sln.ctor.name}::constructor::parameters[${i}]`;
            const p = dtr.ctorInjections[i];
            ctorParams.push(await this.resolve(p.token, {
                ...p.opts,
                position,
            }));
        }
        const props = {};
        for (const k in dtr.propInjections) {
            const position = `class ${sln.ctor.name}::property::${k}`;
            const i = dtr.propInjections[k];
            props[k] = await this.resolve(i.token, {
                ...i.opts,
                position,
            });
        }
        const obj = new dtr.ctor(...ctorParams);
        for (const k in obj) {
            const i = obj[k];
            if (i instanceof I.WaitForInjection) {
                const position = `class ${sln.ctor.name}::property::${k}`;
                obj[k] = await this.resolve(i.token, {
                    ...i.opts,
                    position,
                });
            }
        }
        for (const k in props) {
            obj[k] = props[k];
        }
        if (dtr.init) {
            const initResult = obj[dtr.init](this);
            if (initResult instanceof Promise) {
                await initResult;
            }
        }
        if (dtr.singletonMode) {
            this._singletons.set(token, obj);
        }
        return obj;
    }
    _matchSolution(sln, token, tag) {
        if (sln.tag !== undefined && tag !== undefined && sln.tag !== tag) {
            return false;
        }
        if (sln.token !== undefined && sln.token !== token) {
            return false;
        }
        return true;
    }
    _getSolution(token, tag) {
        const slns = [
            ...(this._tokenSolutions.get(token) ?? []),
            ...(tag !== undefined ? (this._tagSolutions.get(tag) ?? []) : []),
        ]
            .filter((i) => this._matchSolution(i, token, tag))
            .sort((a, b) => a.privilege - b.privilege);
        return slns[0] ?? null;
    }
    _getSingleton(ctor) {
        return this._singletons.get(ctor) ?? undefined;
    }
    _getNamedValues(name) {
        return this._namedValues.get(name) ?? undefined;
    }
    _autoBind(token, sln) {
        switch (typeof token) {
            case 'string':
            case 'symbol':
            case 'function': {
                sln.token = token;
                sln.privilege += PRIVILEGE_TOKEN;
                if (sln.type !== 'value') {
                    const slns = this._tokenSolutions.get(token) ?? [];
                    slns.push(sln);
                    this._tokenSolutions.set(token, slns);
                }
                else {
                    this._tokenSolutions.set(token, [sln]);
                }
                break;
            }
            case 'object': {
                if (!token.tag && !token.token) {
                    throw new E.E_UNCLEAR_BIND({ expression: this._tokenToString(token.token), solution: sln });
                }
                sln.tag = token.tag;
                sln.token = token.token;
                if (sln.token !== undefined) {
                    sln.privilege += PRIVILEGE_TOKEN;
                    const slns = this._tokenSolutions.get(sln.token) ?? [];
                    slns.push(sln);
                    this._tokenSolutions.set(sln.token, slns);
                }
                if (sln.tag) {
                    sln.privilege += PRIVILEGE_TAG;
                    const slns = this._tagSolutions.get(sln.tag) ?? [];
                    slns.push(sln);
                    this._tagSolutions.set(sln.tag, slns);
                }
                break;
            }
            default: {
                break;
            }
        }
    }
    bindValue(token, value) {
        this._autoBind(token, { type: 'value', value, privilege: 0 });
        return this;
    }
    bindClass(token, ctor) {
        this._autoBind(token, { type: 'class', ctor, privilege: 0 });
        return this;
    }
    bindFactory(token, factory) {
        this._autoBind(token, { type: 'factory', factory, privilege: 0 });
        return this;
    }
    bindProducer(token, producer) {
        this._autoBind(token, { type: 'producer', producer, privilege: 0 });
        return this;
    }
}
exports.Container = Container;
//# sourceMappingURL=Container.js.map