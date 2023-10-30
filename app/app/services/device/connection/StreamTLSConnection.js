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
exports.StreamTLSConnection = void 0;
const DI = __importStar(require("#fx/di"));
const Command_1 = require("../../core/Command");
const DeviceStreamManager_1 = require("./DeviceStreamManager");
const AbstractTLSConnection_1 = require("./AbstractTLSConnection");
let StreamTLSConnection = class StreamTLSConnection extends AbstractTLSConnection_1.AbstractTLSConnection {
    _onClose(socket) {
        const uid = this._socketDeviceMap.get(socket);
        if (uid) {
            this._deviceStreamMngr.onDeviceConnecionClose(uid);
        }
        else {
            this._logs.error({
                'action': 'closed',
                'message': 'uid not found',
                'data': {
                    uid
                }
            });
        }
    }
    _handleDevicePacket(socket, item, header) {
        switch (header.cmd) {
            case Command_1.ECommand.NET_APP_HAND_SHAKE_V30:
                this._onHandshake(socket, Buffer.concat(item.payload), header.requestId, 'streamTLSConnection');
                break;
            case Command_1.ECommand.NET_PREVIEW_V30:
            case Command_1.ECommand.NET_REPLAY_V30:
                if (!this._socketDeviceMap.get(socket)) {
                    this._logs.error({
                        'action': 'handleDevicePacket',
                        'message': 'uid not found'
                    });
                    socket.destroy();
                    return;
                }
                this._deviceStreamMngr.onDeviceStream({
                    'uid': this._socketDeviceMap.get(socket),
                    'requestId': header.requestId,
                    'seekSeq': header.responseCode,
                    'streamBuffers': item.payload,
                    'externXML': item.externXML
                });
                break;
            default:
                this._logs.error({
                    'action': 'handleDevicePacket',
                    'message': 'unknow command found',
                    'data': {
                        cmd: header.cmd
                    }
                });
                socket.destroy();
                break;
        }
    }
};
__decorate([
    DI.Inject(),
    __metadata("design:type", DeviceStreamManager_1.DeviceStreamManager)
], StreamTLSConnection.prototype, "_deviceStreamMngr", void 0);
StreamTLSConnection = __decorate([
    DI.Singleton()
], StreamTLSConnection);
exports.StreamTLSConnection = StreamTLSConnection;
//# sourceMappingURL=StreamTLSConnection.js.map