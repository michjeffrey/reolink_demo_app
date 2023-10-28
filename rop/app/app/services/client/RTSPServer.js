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
exports.RTSPServer = void 0;
const net = __importStar(require("net"));
const DI = __importStar(require("#fx/di"));
const U = __importStar(require("#fx/utils"));
const Logs = __importStar(require("#fx/log"));
const RtspSession_1 = require("../rtspServer/RtspSession");
const sessions_1 = require("../rtspServer/sessions");
let RTSPServer = class RTSPServer {
    constructor() {
        this._sessionMngr = new sessions_1.SessionManager();
        this._server = net.createServer();
    }
    start(clientRtspPort, clientHttpPort) {
        this._server.on('connection', socket => {
            new RtspSession_1.RtspSession(socket, this._sessionMngr, `http://127.0.0.1:${clientHttpPort}/v1.0/rtsp/describe`, `http://127.0.0.1:${clientHttpPort}/v1.0/rtsp/play`);
        }).on('error', err => {
            this._logs.error({
                'action': 'startRtspServer',
                'message': 'nok',
                'data': U.Errors.errorToJson(err)
            });
        }).on('listening', () => {
            this._logs.info({
                'action': 'startRtspServer',
                'message': `RTSP server listening on port:${clientRtspPort}.`,
            });
        });
        this._server.listen(clientRtspPort);
    }
};
__decorate([
    Logs.UseLogger('default'),
    __metadata("design:type", Object)
], RTSPServer.prototype, "_logs", void 0);
RTSPServer = __decorate([
    DI.Singleton(),
    __metadata("design:paramtypes", [])
], RTSPServer);
exports.RTSPServer = RTSPServer;
//# sourceMappingURL=RTSPServer.js.map