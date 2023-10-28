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
exports.OnlineDeviceManager = void 0;
const DI = __importStar(require("#fx/di"));
const device_1 = require("../../errors/device");
let OnlineDeviceManager = class OnlineDeviceManager {
    constructor() {
        this._devices = {};
    }
    getDevice(uid) {
        return this._devices[uid];
    }
    setDeviceSuport(uid, support) {
        if (this._devices[uid]) {
            this._devices[uid].deviceSupport = support;
        }
    }
    getSupport(uid) {
        if (!this._devices[uid]) {
            throw new device_1.E_DEVICE_OFFLINE();
        }
        return this._devices[uid].deviceSupport;
    }
    initDevice(args) {
        if (!this._devices[args.uid]) {
            this._devices[args.uid] = {
                ...args,
                'keepAliveConnection': false,
                'signalingConnection': false
            };
        }
    }
    reduceDevice(args) {
        if (args.connection === 'keepAliveConnection') {
            if (this._devices[args.uid]) {
                this._devices[args.uid].keepAliveConnection = false;
            }
        }
        else {
            if (this._devices[args.uid]) {
                this._devices[args.uid].signalingConnection = false;
            }
        }
        if (!this._devices[args.uid]?.keepAliveConnection && !this._devices[args.uid]?.signalingConnection) {
            delete this._devices[args.uid];
        }
    }
    addDevice(args) {
        if (args.connection === 'keepAliveConnection') {
            if (!this._devices[args.uid]) {
                this._devices[args.uid] = {
                    ...args,
                    'keepAliveConnection': false,
                    'signalingConnection': false
                };
            }
            this._devices[args.uid].keepAliveConnection = true;
        }
        else {
            if (!this._devices[args.uid]) {
                this._devices[args.uid] = {
                    ...args,
                    'keepAliveConnection': false,
                    'signalingConnection': false
                };
            }
            this._devices[args.uid].signalingConnection = true;
        }
    }
    deleteDevice(uid) {
        delete this._devices[uid];
    }
    isBatteryDevice(uid) {
        return !!(this._devices[uid]?.family === 'battery');
    }
    getDeviceList() {
        return Object.values(this._devices);
    }
};
OnlineDeviceManager = __decorate([
    DI.Singleton()
], OnlineDeviceManager);
exports.OnlineDeviceManager = OnlineDeviceManager;
//# sourceMappingURL=OnlineDeviceManager.js.map