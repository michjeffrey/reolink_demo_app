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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const DI = __importStar(require("#fx/di"));
const Store_1 = require("./Store");
const E = __importStar(require("./Errors"));
const C = __importStar(require("./Common"));
const I = __importStar(require("./Internal"));
let ConfigManager = class ConfigManager {
    constructor() {
        this._ns = {};
    }
    add(config, ns = C.DEFAULT_CONFIG_NS) {
        if (this._ns[ns]) {
            throw new E.E_DUP_CONFIG_NAMESPACE({ ns });
        }
        this._ns[ns] = config;
        this._container.bindProducer({ tag: I.mkNsTag(ns) }, (_c, _t, o) => config.fetch(o.context.opts));
        this._container.bindValue(I.mkNsTag(ns), config);
    }
    unload(ns) {
        delete this._ns[ns];
    }
    getConfigStore(ns = C.DEFAULT_CONFIG_NS) {
        const cfg = this._ns[ns];
        if (!cfg) {
            throw new E.E_NO_SUCH_NAMESPACE({ ns });
        }
        return cfg;
    }
    hasConfigStore(ns = C.DEFAULT_CONFIG_NS) {
        return !!this._ns[ns];
    }
    load(path, ns = C.DEFAULT_CONFIG_NS) {
        this.add(new Store_1.ConfigStore(path, ns), ns);
    }
    createEmptyConfigStore(ns) {
        return new Store_1.ConfigStore(I.NO_PATH, ns);
    }
    fetch(opts) {
        const cfg = this._ns[opts.ns ?? C.DEFAULT_CONFIG_NS];
        if (!cfg) {
            throw new E.E_NO_SUCH_NAMESPACE({ ns: opts.ns ?? C.DEFAULT_CONFIG_NS });
        }
        return cfg.fetch(opts);
    }
};
__decorate([
    DI.UseContainer(),
    __metadata("design:type", Object)
], ConfigManager.prototype, "_container", void 0);
ConfigManager = __decorate([
    DI.Singleton()
], ConfigManager);
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=Manager.js.map