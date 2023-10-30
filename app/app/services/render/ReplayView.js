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
exports.ReplayView = exports.MAX_REPLAY_COUNT = void 0;
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Time_1 = require("../core/Time");
exports.MAX_REPLAY_COUNT = 40;
let ReplayView = class ReplayView {
    createUserView(fileList, preRows) {
        let totalRows = 0;
        totalRows = parseInt(fileList.body.attr002) + preRows;
        const ret = {
            totalRows,
            nextToken: undefined,
            'items': []
        };
        if (!fileList.body?.Param006?.attr001) {
            return ret;
        }
        fileList.body.Param006.attr001 = U.Array.ensureArray(fileList.body.Param006.attr001);
        for (const fileInfo of fileList.body.Param006.attr001) {
            ret.items.push({
                'channel': parseInt(fileInfo.attr001),
                'fileName': fileInfo.attr007,
                'startTime': this._timeUtil.genClientTimeString(fileInfo.attr012),
                'endTime': this._timeUtil.genClientTimeString(fileInfo.attr013),
                'streamType': fileInfo.attr002
            });
        }
        if (ret.items.length === exports.MAX_REPLAY_COUNT) {
            const flist = fileList.body.Param006.attr001;
            const endTime = this._timeUtil.genClientTimeString(flist[flist.length - 1].attr013);
            const nextTokenContent = JSON.stringify({
                nextTime: this._timeUtil.formatTimeToString(new Date(endTime).getTime() + 1000),
                'rows': preRows + exports.MAX_REPLAY_COUNT
            });
            ret.nextToken = Buffer.from(nextTokenContent).toString('base64url');
        }
        return ret;
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", Time_1.TimeUtil)
], ReplayView.prototype, "_timeUtil", void 0);
ReplayView = __decorate([
    DI.Singleton()
], ReplayView);
exports.ReplayView = ReplayView;
//# sourceMappingURL=ReplayView.js.map