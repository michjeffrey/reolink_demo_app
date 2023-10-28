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
exports.SchedulerRunner = void 0;
const DI = __importStar(require("#fx/di"));
const KeepAliveScheduler_1 = require("./KeepAliveScheduler");
const LiveSessionScheduler_1 = require("./LiveSessionScheduler");
const ServerCertScheduler_1 = require("./ServerCertScheduler");
const SignalingScheduler_1 = require("./SignalingScheduler");
const StreamPushScheduler_1 = require("./StreamPushScheduler");
const WifiSessionScheduler_1 = require("./WifiSessionScheduler");
let SchedulerRunner = class SchedulerRunner {
    run() {
        this._serverCertScheduler.start();
        this._keepAliveScheduler.start();
        this._signalingScheduler.start();
        this._streamScheduler.start();
        this._liveSessionScheduler.start();
        this._wifiSessionScheduler.start();
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", KeepAliveScheduler_1.KeepAliveScheduler)
], SchedulerRunner.prototype, "_keepAliveScheduler", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", ServerCertScheduler_1.ServerCertScheduler)
], SchedulerRunner.prototype, "_serverCertScheduler", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", SignalingScheduler_1.SignalingScheduler)
], SchedulerRunner.prototype, "_signalingScheduler", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", StreamPushScheduler_1.StreamScheduler)
], SchedulerRunner.prototype, "_streamScheduler", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", LiveSessionScheduler_1.LiveSessionScheduler)
], SchedulerRunner.prototype, "_liveSessionScheduler", void 0);
__decorate([
    DI.Inject(),
    __metadata("design:type", WifiSessionScheduler_1.WifiSessionScheduler)
], SchedulerRunner.prototype, "_wifiSessionScheduler", void 0);
SchedulerRunner = __decorate([
    DI.Singleton()
], SchedulerRunner);
exports.SchedulerRunner = SchedulerRunner;
//# sourceMappingURL=SchedulerRunner.js.map