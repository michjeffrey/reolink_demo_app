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
exports.ConfigStore = void 0;
const E = __importStar(require("./Errors"));
const _ = __importStar(require("#fx/utils"));
const $TyG = __importStar(require("#fx/typeguard"));
const $FS = __importStar(require("fs"));
const I = __importStar(require("./Internal"));
class ConfigStore {
    constructor(path, ns) {
        this.path = path;
        this.ns = ns;
        this._data = {};
        if (path !== I.NO_PATH) {
            try {
                switch (_.Path.extractExtNameInPath(path).toLowerCase()) {
                    case '.json':
                        this._data = _.File.readJsonFileSync(path, true);
                        break;
                    case '.yml':
                        this._data = this._getYmlLib().parse($FS.readFileSync(path, { encoding: 'utf8' }));
                        break;
                    default:
                        throw new E.E_UNSUPPORTED_FORMAT({ path });
                }
            }
            catch (e) {
                throw new E.E_READ_CONFIG_FAILED({ path }, e);
            }
            if (this._data === null || typeof this._data !== 'object') {
                throw new E.E_MALFORMED_CONFIG({ path });
            }
        }
    }
    _getYmlLib() {
        if (!this._libYAML) {
            this._libYAML = require('yaml');
        }
        return this._libYAML;
    }
    getJSONString(pretty = false) {
        return pretty ? JSON.stringify(this._data, null, 2) : JSON.stringify(this._data);
    }
    getYAMLString() {
        return this._getYmlLib().stringify(this._data);
    }
    _get(path, defaultValue) {
        if (!path.trim()) {
            return this._data;
        }
        const segs = path.split('.');
        let data = this._data;
        for (const k of segs) {
            if (typeof data !== 'object' || data === null) {
                return defaultValue;
            }
            data = data[k];
        }
        return data === undefined ? defaultValue : data;
    }
    fetch(opts) {
        if (!opts.path.trim()) {
            return this._data;
        }
        const segs = opts.path.split('.');
        let data = this._data;
        const defaultValues = _.Validation.isFunction(opts.defaultValue) ? opts.defaultValue() : opts.defaultValue;
        for (const k of segs) {
            if (!_.Validation.isRawObject(data)) {
                if (!_.Validation.isUndefined(defaultValues)) {
                    return defaultValues;
                }
                const errCtor = opts.notFoundException ?? E.E_NO_SUCH_CONFIG;
                throw new errCtor({ subPath: opts.path, rootPath: this.path, configNS: this.ns });
            }
            data = data[k];
        }
        if (_.Validation.isUndefined(data)) {
            if (_.Validation.isUndefined(defaultValues)) {
                const errCtor = opts.notFoundException ?? E.E_NO_SUCH_CONFIG;
                throw new errCtor({ subPath: opts.path, rootPath: this.path, configNS: this.ns });
            }
            data = defaultValues;
        }
        else if (opts.appendDefault && _.Validation.isRawObject(defaultValues) && _.Validation.isRawObject(data)) {
            data = _.Object.deepMerge(defaultValues, data, { 'arrayAsValue': true });
        }
        if (opts.preprocess || opts.postprocess) {
            data = JSON.parse(JSON.stringify(data));
        }
        if (_.Validation.isFunction(opts.preprocess)) {
            try {
                data = opts.preprocess(data);
            }
            catch (e) {
                const errCtor = opts.malformedException ?? E.E_NO_SUCH_CONFIG;
                throw new errCtor({ subPath: opts.path, rootPath: this.path, configNS: this.ns }, e);
            }
        }
        if (opts.validation !== undefined) {
            const check = $TyG.getInlineCompiler().compile({ rule: opts.validation, traceErrors: true });
            const traces = [];
            if (!check(data, traces)) {
                const errCtor = opts.malformedException ?? E.E_MALFORMED_CONFIG;
                throw new errCtor({
                    subPath: opts.path,
                    rootPath: this.path,
                    configNS: this.ns,
                    validation: opts.validation,
                    traces
                });
            }
        }
        if (_.Validation.isFunction(opts.postprocess)) {
            try {
                data = opts.postprocess(data);
            }
            catch (e) {
                const errCtor = opts.malformedException ?? E.E_NO_SUCH_CONFIG;
                throw new errCtor({ subPath: opts.path, rootPath: this.path, configNS: this.ns }, e);
            }
        }
        return data;
    }
    pick(path) {
        const data = this._get(path);
        if (typeof data === 'object' && data !== null) {
            const config = new ConfigStore(I.NO_PATH, this.ns);
            config._data = data;
            return config;
        }
        throw new E.E_NO_SUCH_CONFIG({ path });
    }
    set(path, value) {
        const segs = path.split('.');
        let vessel = this._data;
        let s = segs.shift();
        while (s) {
            if (segs.length) {
                if (typeof vessel[s] !== 'object' && vessel[s] !== undefined) {
                    throw new E.E_MALFORMED_CONFIG({ path, value });
                }
                if (!vessel[s]) {
                    vessel[s] = {};
                }
                vessel = vessel[s];
            }
            else {
                vessel[s] = value;
            }
            s = segs.shift();
        }
    }
}
exports.ConfigStore = ConfigStore;
//# sourceMappingURL=Store.js.map