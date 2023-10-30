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
exports.KeepAliveScheduler = void 0;
const DI = __importStar(require("#fx/di"));
const Config = __importStar(require("#fx/config"));
const Logs = __importStar(require("#fx/log"));
const U = __importStar(require("#fx/utils"));
const KeepAliveConnection_1 = require("../services/device/connection/KeepAliveConnection");
let KeepAliveScheduler = class KeepAliveScheduler {
    async _run() {
        do {
            try {
                this._keepAliveConn.checkTimeout();
            }
            catch (e) {
                this._logs.error({
                    'action': 'KeepAliveScheduler',
                    'message': 'nok',
                    'data': U.Errors.errorToJson(e)
                });
            }
            finally {
                await U.Async.sleep(this._interval);
            }
        } while (true);
    }
    start() {
        U.Async.invokeAsync(async () => {
            this._logs.info({
                'action': 'KeepAliveScheduler',
                'message': 'ok'
            });
            await this._run();
        });
    }
};
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], KeepAliveScheduler.prototype, "_logs", void 0);
__decorate([
    Config.BindConfig({
        'path': 'interval.checkKeepAlive',
        'validation': 'uint',
        'defaultValue': 1000
    }),
    __metadata("design:type", Number)
], KeepAliveScheduler.prototype, "_interval", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", KeepAliveConnection_1.KeepAliveConnection)
], KeepAliveScheduler.prototype, "_keepAliveConn", void 0);
KeepAliveScheduler = __decorate([
    DI.Singleton()
], KeepAliveScheduler);
exports.KeepAliveScheduler = KeepAliveScheduler;
//# sourceMappingURL=KeepAliveScheduler.js.map