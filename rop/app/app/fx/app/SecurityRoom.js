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
exports.SecurityRoom = void 0;
const E = __importStar(require("./Errors"));
const DI = __importStar(require("#fx/di"));
let SecurityRoom = class SecurityRoom {
    setUser(user, group, extraGroup = group) {
        if (this.isRunningAsRoot()) {
            process.initgroups(user, extraGroup);
            process.setgid(group);
            process.setuid(user);
        }
        else {
            throw new E.E_PERMISSION_DENIED({
                action: 'setuser',
                user, group,
                currentUser: this.getUserId(),
                currentGroup: this.getGroupIdList(),
            });
        }
    }
    setEffectiveUser(user, group, extraGroup = group) {
        if (this.isRunningAsRoot()) {
            if (user === 'root' || user === 0) {
                process.seteuid(user);
                process.initgroups(user, extraGroup);
                process.setegid(group);
            }
            else {
                process.initgroups(user, extraGroup);
                process.setegid(group);
                process.seteuid(user);
            }
        }
        else {
            throw new E.E_PERMISSION_DENIED({
                action: 'setuser',
                user, group,
                currentUser: this.getUserId(),
                currentGroup: this.getGroupIdList(),
            });
        }
    }
    getGroupIdList() {
        return process.getgroups();
    }
    getUserId() {
        return process.getuid();
    }
    isRunningAsRoot() {
        return process.getuid() === 0;
    }
    isWorkingAsRoot() {
        return process.geteuid() === 0;
    }
};
SecurityRoom = __decorate([
    DI.Singleton()
], SecurityRoom);
exports.SecurityRoom = SecurityRoom;
//# sourceMappingURL=SecurityRoom.js.map