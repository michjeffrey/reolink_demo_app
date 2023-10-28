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
exports.ControllerRouter = void 0;
const Http = __importStar(require("@litert/http"));
const fs = __importStar(require("fs"));
const pathUtils = __importStar(require("path"));
const DI = __importStar(require("#fx/di"));
const Logger = __importStar(require("#fx/log"));
const U = __importStar(require("#fx/utils"));
const client_1 = require("../errors/client");
const server_1 = require("../errors/server");
const META_KEY_RULE = 'litert:http:router:rules';
class ControllerRouter {
    constructor() {
        this._router = Http.createStandardRouter();
        this._ctr = DI.useContainer();
    }
    route(method, path, context) {
        return this._router.route(method, path, context);
    }
    getRouter() {
        return this._router;
    }
    _invalidParameterError(ctx) {
        const error = new client_1.E_INVALID_PARAMETER();
        ctx.response.statusCode = error.metadata['statusCode'];
        ctx.response.sendJSON({
            'error': {
                'symbol': error.name,
                'message': error.message
            }
        });
    }
    loadControllers(root) {
        if (!fs.existsSync(root)) {
            throw new Error('The path of controllers/middlewares does not exist');
        }
        const items = fs.readdirSync(root);
        for (const item of items) {
            if (item.startsWith('.')) {
                continue;
            }
            if (item.endsWith('.js')) {
                const path = pathUtils.resolve(root, item);
                const cls = require(`${path.slice(0, -3)}`).default;
                for (const method of Object.getOwnPropertyNames(cls.prototype)) {
                    const data = Reflect.getMetadata(META_KEY_RULE, cls.prototype, method);
                    if (data === undefined) {
                        continue;
                    }
                    for (const rule of data) {
                        if (rule.method === 'NOT_FOUND') {
                            this._router.notFound(async (ctx) => {
                                const controller = await this._ctr.resolve(cls);
                                return controller[method](ctx);
                            });
                            continue;
                        }
                        this._router.register(rule.method, rule.path, async (ctx) => {
                            const controller = await this._ctr.resolve(cls);
                            try {
                                if (ctx.data['validator']) {
                                    if (ctx.data['validator']['params']) {
                                        const params = ctx.request.params;
                                        if (!ctx.data['validator']['params'](params)) {
                                            this._invalidParameterError(ctx);
                                            return;
                                        }
                                    }
                                    if (ctx.data['validator']['body']) {
                                        try {
                                            const body = await ctx.request.getContent({ 'type': 'json' });
                                            if (!ctx.data['validator']['body'](body)) {
                                                this._invalidParameterError(ctx);
                                                return;
                                            }
                                        }
                                        catch {
                                            this._invalidParameterError(ctx);
                                            return;
                                        }
                                    }
                                    if (ctx.data['validator']['query']) {
                                        if (!ctx.data['validator']['query'](ctx.request.query)) {
                                            this._invalidParameterError(ctx);
                                            return;
                                        }
                                    }
                                }
                                await controller[method](ctx);
                            }
                            catch (error) {
                                if (error?.metadata?.['statusCode']) {
                                    ctx.response.statusCode = error.metadata['statusCode'];
                                    ctx.response.sendJSON({
                                        'error': {
                                            'symbol': error.name,
                                            'message': error.message
                                        }
                                    });
                                }
                                else {
                                    const err = new server_1.E_SERVER_INTERNAL_ERROR();
                                    ctx.response.statusCode = err.metadata['statusCode'];
                                    ctx.response.sendJSON({
                                        'error': {
                                            'symbol': err.name,
                                            'message': err.message,
                                            'data': U.Errors.errorToJson(error)
                                        }
                                    });
                                    this._logs.error({
                                        'action': 'execController',
                                        'message': 'nok',
                                        'data': U.Errors.errorToJson(error)
                                    });
                                }
                            }
                        }, rule.data);
                    }
                }
            }
            else if (fs.statSync(`${root}/${item}`).isDirectory()) {
                this.loadControllers(`${root}/${item}`);
            }
        }
        return this;
    }
}
__decorate([
    Logger.UseLogger('default'),
    __metadata("design:type", Object)
], ControllerRouter.prototype, "_logs", void 0);
exports.ControllerRouter = ControllerRouter;
//# sourceMappingURL=ControllerRouter.js.map