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
exports.TimeUtil = void 0;
const DI = __importStar(require("#fx/di"));
let TimeUtil = class TimeUtil {
    formatTimeToString(time) {
        return new Date(time).toISOString().replace(/T/, ' ').replace(/\.\d+Z/, '');
    }
    genClientTimeString(s) {
        return `${s.attr001}-${s.attr002.padStart(2, '0')}-${s.attr003.padStart(2, '0')} ${s.attr004.padStart(2, '0')}:${s.attr005.padStart(2, '0')}:${s.attr006.padStart(2, '0')}`;
    }
    genDeviceTime(timeArgs) {
        const date = new Date(timeArgs);
        return {
            'attr001': date.getFullYear().toString(),
            'attr002': (date.getMonth() + 1).toString(),
            'attr003': date.getDate().toString(),
            'attr004': date.getHours().toString(),
            'attr005': date.getMinutes().toString(),
            'attr006': date.getSeconds().toString()
        };
    }
};
TimeUtil = __decorate([
    DI.Singleton()
], TimeUtil);
exports.TimeUtil = TimeUtil;
//# sourceMappingURL=Time.js.map