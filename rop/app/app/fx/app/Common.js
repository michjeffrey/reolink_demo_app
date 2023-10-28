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
exports.AbstractApplication = void 0;
const DI = __importStar(require("#fx/di"));
const TerminationHook_1 = require("./TerminationHook");
const SecurityRoom_1 = require("./SecurityRoom");
class AbstractApplication {
    constructor() {
        this._termination = DI.use(TerminationHook_1.TerminationHook);
        this._securityRoom = DI.use(SecurityRoom_1.SecurityRoom);
    }
    static setup(_ctr) {
        return;
    }
    static onInit(_ctr) {
        return;
    }
    static onUninit(_ctr) {
        return;
    }
}
exports.AbstractApplication = AbstractApplication;
//# sourceMappingURL=Common.js.map