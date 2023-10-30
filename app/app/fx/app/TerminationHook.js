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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminationHook = void 0;
const DI = __importStar(require("#fx/di"));
const voidFn = () => { return; };
let TerminationHook = class TerminationHook {
    constructor() {
        this._blocked = false;
        this.shutdown = () => {
            this.unholdProcess();
            this.unblockTermSignals();
            this._shutdownResolver?.();
            process
                .off('SIGTERM', this.shutdown)
                .off('SIGINT', this.shutdown);
        };
    }
    get isTermSignalBlocked() {
        return this._blocked;
    }
    get isProcessHeld() {
        return this._processHolder !== undefined;
    }
    blockTermSignals() {
        if (this._blocked) {
            return;
        }
        this._blocked = true;
        process
            .on('SIGTERM', voidFn)
            .on('SIGINT', voidFn);
    }
    unblockTermSignals() {
        if (!this._blocked) {
            return;
        }
        this._blocked = false;
        process
            .off('SIGTERM', voidFn)
            .off('SIGINT', voidFn);
    }
    holdProcess() {
        if (undefined !== this._processHolder) {
            return;
        }
        this._processHolder = setInterval(() => null, 3600000);
    }
    unholdProcess() {
        if (this._processHolder === undefined) {
            return;
        }
        clearInterval(this._processHolder);
        delete this._processHolder;
    }
    wait() {
        if (undefined !== this._shutdownPromise) {
            return this._shutdownPromise;
        }
        this._shutdownPromise = new Promise((resolve) => {
            this._shutdownResolver = resolve;
        });
        this.holdProcess();
        process
            .on('SIGTERM', this.shutdown)
            .on('SIGINT', this.shutdown);
        return this._shutdownPromise;
    }
};
TerminationHook = __decorate([
    DI.Singleton()
], TerminationHook);
exports.TerminationHook = TerminationHook;
//# sourceMappingURL=TerminationHook.js.map