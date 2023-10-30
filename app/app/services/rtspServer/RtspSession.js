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
exports.RtspSession = exports.socketTimeout = void 0;
const url = __importStar(require("url"));
const rtpParser = __importStar(require("./RtpParser"));
const bufferPool = __importStar(require("./BufferPool"));
const dgram = __importStar(require("dgram"));
const net = __importStar(require("net"));
const U = __importStar(require("#fx/utils"));
const SdpParser_1 = require("./SdpParser");
const httpClient = __importStar(require("@litert/http-client"));
exports.socketTimeout = 15000;
class RtspSession {
    constructor(_socket, _sessionMngr, _onDescribeURL, _onPlayURL) {
        this._socket = _socket;
        this._sessionMngr = _sessionMngr;
        this._onDescribeURL = _onDescribeURL;
        this._onPlayURL = _onPlayURL;
        this._playSessions = {};
        this._transType = 'tcp';
        this._type = 'pusher';
        this._url = '';
        this._path = '';
        this._gopCached = false;
        this._waitNextIframe = false;
        this._aControl = '';
        this._vControl = '';
        this._aRTPChannel = 2;
        this._aRTPControlChannel = 3;
        this._vRTPChannel = 0;
        this._vRTPControlChannel = 1;
        this._aRTPClientPort = 0;
        this._aRTPClientSocket = null;
        this._aRTPControlClientPort = 0;
        this._aRTPControlClientSocket = null;
        this._vRTPClientPort = 0;
        this._vRTPClientSocket = null;
        this._vRTPControlClientPort = 0;
        this._vRTPControlClientSocket = null;
        this._aRTPServerPort = 0;
        this._aRTPServerSocket = null;
        this._aRTPControlServerPort = 0;
        this._aRTPControlServerSocket = null;
        this._vRTPServerPort = 0;
        this._vRTPServerSocket = null;
        this._vRTPControlServerPort = 0;
        this._vRTPControlserverSokcet = null;
        this._rtpParser = new rtpParser.RtpParser();
        this._sdp = null;
        this._sdpRaw = '';
        this._aCodec = '';
        this._aRate = 0;
        this._aPayload = 0;
        this._vCodec = '';
        this._vRate = 0;
        this._vPayload = 0;
        this._inBytes = 0;
        this._outBytes = 0;
        this._gopCache = [];
        this._httpClient = httpClient.createHttpClient();
        this._lastUnsubscribeAt = Date.now();
        this._sid = U.String.randomString(16) + (Date.now() % 10000).toString();
        this._host = this._socket.address().address;
        this._bufferPool = new bufferPool.BufferPool(this._handleData());
        this._bufferPool.init();
        this._socket.setTimeout(exports.socketTimeout, () => {
            console.log('socket timeout at:', Date.now());
            this._socket.destroy();
        });
        this._socket.on('data', data => {
            this._bufferPool.push(data);
        }).on('close', () => {
            this._stop();
        }).on('error', (e) => {
            this._socket.destroy();
            console.log(e);
        }).on('timeout', () => {
            this._socket.end();
        });
    }
    _closeUDPSocket(socket) {
        if (socket) {
            socket.close();
        }
    }
    _stop() {
        this._bufferPool.stop();
        if (this._type == 'pusher') {
            delete this._sessionMngr.sessions[this._path];
        }
        else if (this._type == 'player' && this._pushSession) {
            this._pushSession._lastUnsubscribeAt = Date.now();
            delete this._pushSession._playSessions[this._sid];
            if (this._pushSession?._playSessions) {
                if (Object.keys(this._pushSession._playSessions).length === 0) {
                    console.log('destroy pusher for no client subscribe.');
                    this._pushSession._socket.destroy();
                }
            }
            else {
                console.log('destroy pusher for no client subscribe.');
                this._pushSession._socket.destroy();
            }
        }
        this._closeUDPSocket(this._aRTPClientSocket);
        this._closeUDPSocket(this._aRTPControlClientSocket);
        this._closeUDPSocket(this._vRTPClientSocket);
        this._closeUDPSocket(this._vRTPControlClientSocket);
        this._closeUDPSocket(this._aRTPServerSocket);
        this._closeUDPSocket(this._aRTPControlServerSocket);
        this._closeUDPSocket(this._vRTPServerSocket);
        this._closeUDPSocket(this._vRTPControlserverSokcet);
        console.log(`rtsp session[type=${this._type}, path=${this._path}, sid=${this._sid}], inBytes=${this._inBytes}, outBytes=${this._outBytes} end.`);
    }
    async _getPort() {
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            server.unref();
            server.on('error', reject);
            server.listen(null, () => {
                const port = server.address().port;
                server.close(() => {
                    resolve(port);
                });
            });
        });
    }
    _parseRequestHeader(header = '') {
        const ret = {
            'raw': header,
            'method': '',
            'url': ''
        };
        const lines = header.trim().split('\r\n');
        if (lines.length == 0) {
            return ret;
        }
        let line = lines[0];
        let items = line.split(/\s+/);
        ret.method = items[0];
        ret.url = items[1];
        for (let i = 1; i < lines.length; i++) {
            line = lines[i];
            items = line.split(/:\s+/);
            ret[items[0]] = items[1];
        }
        return ret;
    }
    *_handleData() {
        while (true) {
            if (this._bufferPool.need(1)) {
                if (yield)
                    return;
            }
            let buf = this._bufferPool.read(1);
            if (buf.readUInt8() == 0x24) {
                if (this._bufferPool.need(3)) {
                    if (yield)
                        return;
                }
                buf = this._bufferPool.read(3);
                const channel = buf.readUInt8();
                const rtpLen = buf.readUInt16BE(1);
                if (this._bufferPool.need(rtpLen)) {
                    if (yield)
                        return;
                }
                const rtpBody = this._bufferPool.read(rtpLen);
                if (channel == this._aRTPChannel) {
                    this._broadcastAudio(rtpBody);
                }
                else if (channel == this._vRTPChannel) {
                    const vCodec = this._vCodec.toUpperCase();
                    if ((vCodec === 'H264' || vCodec === 'H265') && (this._gopCached || this._waitNextIframe)) {
                        const rtp = this._rtpParser.parseRtpPacket(rtpBody);
                        if (this._rtpParser.isKeyframeStart(rtp.payload, vCodec)) {
                            console.log(`find key frame, current gop cache size[${this._gopCache.length}], vCodeC:${vCodec}`);
                            this._gopCache = [];
                            this._waitNextIframe = false;
                        }
                        this._gopCache.push(rtpBody);
                    }
                    this._broadcastVideo(rtpBody);
                }
                else if (channel == this._aRTPControlChannel) {
                    this._broadcastAudioControl(rtpBody);
                }
                else if (channel == this._vRTPControlChannel) {
                    this._broadcastVideoControl(rtpBody);
                }
                this._inBytes += (rtpLen + 4);
            }
            else {
                let reqBuf = Buffer.concat([buf], 1);
                while (true) {
                    if (this._bufferPool.need(1)) {
                        if (yield)
                            return;
                    }
                    buf = this._bufferPool.read(1);
                    reqBuf = Buffer.concat([reqBuf, buf], reqBuf.length + 1);
                    if (buf.toString() == '\n' && reqBuf.toString().endsWith('\r\n\r\n')) {
                        break;
                    }
                }
                const req = this._parseRequestHeader(reqBuf.toString());
                this._inBytes += reqBuf.length;
                if (req['Content-Length']) {
                    const bodyLen = parseInt(req['Content-Length']);
                    if (this._bufferPool.need(bodyLen)) {
                        if (yield)
                            return;
                    }
                    this._inBytes += bodyLen;
                    buf = this._bufferPool.read(bodyLen);
                    const bodyRaw = buf.toString();
                    if (req.method == 'ANNOUNCE') {
                        this._sdp = SdpParser_1.sdpParser.parse(bodyRaw);
                        console.log('ANNOUNCE');
                        this._sdpRaw = bodyRaw;
                        if (this._sdp && this._sdp.media && this._sdp.media.length > 0) {
                            for (const media of this._sdp.media) {
                                if (media.type == 'video') {
                                    this._vControl = media.control;
                                    if (media.rtp && media.rtp.length > 0) {
                                        this._vCodec = media.rtp[0].codec;
                                        this._vRate = media.rtp[0].rate;
                                        this._vPayload = media.rtp[0].payload;
                                    }
                                }
                                else if (media.type == 'audio') {
                                    this._aControl = media.control;
                                    if (media.rtp && media.rtp.length > 0) {
                                        this._aCodec = media.rtp[0].codec;
                                        this._aRate = media.rtp[0].rate;
                                        this._aPayload = media.rtp[0].payload;
                                    }
                                }
                            }
                        }
                    }
                    req.raw += bodyRaw;
                }
                this._handleRequest(req).catch((e) => {
                    console.error(e);
                });
            }
        }
    }
    async _handleRequest(req) {
        console.log(`<<<<<<<<<<< request[${req.method}] <<<<<<<<<<<<<`);
        console.log(req.raw);
        const res = {
            method: req.method,
            headers: {
                CSeq: req['CSeq'],
                Session: this._sid
            }
        };
        switch (req.method) {
            case 'OPTIONS':
                res.headers['Public'] = 'DESCRIBE, SETUP, TEARDOWN, PLAY, OPTIONS, ANNOUNCE, RECORD';
                break;
            case 'ANNOUNCE':
                this._type = 'pusher';
                this._url = req.url;
                console.log(req.url);
                this._path = url.parse(this._url).path ?? '';
                console.log(this._path);
                if (this._sessionMngr.sessions[this._path]) {
                    res.code = 406;
                    res.msg = 'Not Acceptable';
                }
                break;
            case 'SETUP':
                let ts = req['Transport'] || '';
                const control = req.url.substring(req.url.lastIndexOf('/') + 1);
                const mtcp = /interleaved=(\d+)(-(\d+))?/.exec(ts);
                const mudp = /client_port=(\d+)(-(\d+))?/.exec(ts);
                if (mtcp) {
                    this._transType = 'tcp';
                    if (control == this._vControl) {
                        this._vRTPChannel = parseInt(mtcp[1]) || 0;
                        this._vRTPControlChannel = parseInt(mtcp[3]) || 0;
                    }
                    if (control == this._aControl) {
                        this._aRTPChannel = parseInt(mtcp[1]) || 0;
                        this._aRTPControlChannel = parseInt(mtcp[3]) || 0;
                    }
                }
                else if (mudp) {
                    this._transType = 'udp';
                    if (control == this._aControl) {
                        this._aRTPClientPort = parseInt(mudp[1]) || 0;
                        this._aRTPClientSocket = dgram.createSocket('udp4');
                        this._aRTPControlClientPort = parseInt(mudp[3]) || 0;
                        if (this._aRTPControlClientPort) {
                            this._aRTPControlClientSocket = dgram.createSocket('udp4');
                        }
                        if (this._type == 'pusher') {
                            this._aRTPServerPort = await this._getPort();
                            this._aRTPServerSocket = dgram.createSocket('udp4');
                            this._aRTPServerSocket.on('message', buf => {
                                this._inBytes += buf.length;
                                this._broadcastAudio(buf);
                            }).on('error', err => {
                                console.log(err);
                            });
                            await this._bindUDPPort(this._aRTPServerSocket, this._aRTPServerPort);
                            this._aRTPControlServerPort = await this._getPort();
                            this._aRTPControlServerSocket = dgram.createSocket('udp4');
                            this._aRTPControlServerSocket.on('message', buf => {
                                this._inBytes += buf.length;
                                this._broadcastAudioControl(buf);
                            }).on('error', err => {
                                console.log(err);
                            });
                            await this._bindUDPPort(this._aRTPControlServerSocket, this._aRTPControlServerPort);
                            const tss = ts.split(';');
                            tss.splice(tss.indexOf(mudp[0]) + 1, 0, `server_port=${this._aRTPServerPort}-${this._aRTPControlServerPort}`);
                            ts = tss.join(';');
                        }
                    }
                    if (control == this._vControl) {
                        this._vRTPClientPort = parseInt(mudp[1]) || 0;
                        this._vRTPClientSocket = dgram.createSocket('udp4');
                        this._vRTPControlClientPort = parseInt(mudp[3]) || 0;
                        if (this._vRTPControlClientPort) {
                            this._vRTPControlClientSocket = dgram.createSocket('udp4');
                        }
                        if (this._type == 'pusher') {
                            this._vRTPServerPort = await this._getPort();
                            this._vRTPServerSocket = dgram.createSocket('udp4');
                            this._vRTPServerSocket.on('message', buf => {
                                const vCodec = this._vCodec.toUpperCase();
                                if ((vCodec === 'H264' || vCodec === 'H265') && (this._gopCached || this._waitNextIframe)) {
                                    const rtp = this._rtpParser.parseRtpPacket(buf);
                                    if (this._rtpParser.isKeyframeStart(rtp.payload, vCodec)) {
                                        console.log(`find key frame, current gop cache size[${this._gopCache.length}], vCodeC:${vCodec}`);
                                        this._gopCache = [];
                                        this._waitNextIframe = false;
                                    }
                                    this._gopCache.push(buf);
                                }
                                this._inBytes += buf.length;
                                this._broadcastVideo(buf);
                            }).on('error', err => {
                                console.log(err);
                            });
                            await this._bindUDPPort(this._vRTPServerSocket, this._vRTPServerPort);
                            this._vRTPControlServerPort = await this._getPort();
                            this._vRTPControlserverSokcet = dgram.createSocket('udp4');
                            this._vRTPControlserverSokcet.on('message', buf => {
                                this._inBytes += buf.length;
                                this._broadcastVideoControl(buf);
                            });
                            await this._bindUDPPort(this._vRTPControlserverSokcet, this._vRTPControlServerPort);
                            const tss = ts.split(';');
                            tss.splice(tss.indexOf(mudp[0]) + 1, 0, `server_port=${this._vRTPServerPort}-${this._vRTPControlServerPort}`);
                            ts = tss.join(';');
                        }
                    }
                }
                res.headers['Transport'] = ts;
                break;
            case 'DESCRIBE':
                this._type = 'player';
                this._url = req.url;
                this._path = url.parse(this._url).path ?? '';
                const gopCached = await this._onDescribe();
                const pushSession = this._sessionMngr.sessions[this._path];
                if (pushSession && pushSession._sdpRaw) {
                    pushSession._gopCached = gopCached;
                    res.headers['Content-Length'] = pushSession._sdpRaw.length;
                    res.body = pushSession._sdpRaw;
                    this._sdp = pushSession._sdp;
                    this._sdpRaw = pushSession._sdpRaw;
                    this._aControl = pushSession._aControl;
                    this._aCodec = pushSession._aCodec;
                    this._aRate = pushSession._aRate;
                    this._aPayload = pushSession._aPayload;
                    this._vControl = pushSession._vControl;
                    this._vCodec = pushSession._vCodec;
                    this._vRate = pushSession._vRate;
                    this._vPayload = pushSession._vPayload;
                    this._pushSession = pushSession;
                }
                else {
                    res.code = 404;
                    res.msg = 'NOT FOUND';
                }
                break;
            case 'PLAY':
                await this._onPlay();
                process.nextTick(() => {
                    if (this._pushSession) {
                        this._sendGOPCache();
                        this._pushSession._playSessions[this._sid] = this;
                    }
                });
                res.headers['Range'] = req['Range'];
                break;
            case 'RECORD':
                process.nextTick(() => {
                    this._sessionMngr.sessions[this._path] = this;
                });
                break;
            case 'TEARDOWN':
                this._makeResponseAndSend(res);
                this._socket.end();
                if (this._pushSession?._playSessions) {
                    if (Object.keys(this._pushSession._playSessions).length <= 1) {
                        console.log('destroy pusher for no client subscribe.');
                        this._pushSession._socket.destroy();
                    }
                }
                return;
        }
        this._makeResponseAndSend(res);
    }
    async _onDescribe() {
        const reqeust = await this._httpClient.request({
            'url': this._onDescribeURL,
            'method': 'POST',
            'version': 1.1,
            'data': JSON.stringify({
                'URL': this._url
            })
        });
        if (reqeust.statusCode >= 200 && reqeust.statusCode <= 299) {
            const contentStrig = (await reqeust.getBuffer()).toString();
            const gopCached = JSON.parse(contentStrig).gopCached;
            return gopCached;
        }
        else {
            reqeust.abort();
        }
        return false;
    }
    async _onPlay() {
        const request = await this._httpClient.request({
            'url': this._onPlayURL,
            'method': 'POST',
            'version': 1.1,
            'data': JSON.stringify({
                'URL': this._url
            })
        });
        if (request.statusCode >= 200 && request.statusCode <= 299) {
            const contentStrig = (await request.getBuffer()).toString();
            this._waitNextIframe = JSON.parse(contentStrig).waitNextIframe;
        }
        else {
            request.abort();
        }
    }
    _makeResponseAndSend(opt) {
        if (!opt.code) {
            opt.code = 200;
        }
        if (!opt.msg) {
            opt.msg = 'OK';
        }
        let raw = `RTSP/1.0 ${opt.code} ${opt.msg}\r\n`;
        for (const key in opt.headers) {
            raw += `${key}: ${opt.headers[key]}\r\n`;
        }
        raw += '\r\n';
        console.log(`>>>>>>>>>>>>> response[${opt.method}] >>>>>>>>>>>>>`);
        this._socket.write(raw);
        this._outBytes += raw.length;
        if (opt.body) {
            this._socket.write(opt.body);
            this._outBytes += opt.body.length;
        }
        return raw;
    }
    _sendGOPCache() {
        console.log('send Gop Cached length:', this._pushSession._gopCache.length);
        for (const rtpBuf of this._pushSession._gopCache) {
            if (this._transType == 'tcp') {
                const len = rtpBuf.length + 4;
                const headerBuf = Buffer.allocUnsafe(4);
                headerBuf.writeUInt8(0x24, 0);
                headerBuf.writeUInt8(this._vRTPChannel, 1);
                headerBuf.writeUInt16BE(rtpBuf.length, 2);
                this._socket.write(Buffer.concat([headerBuf, rtpBuf], len));
                this._outBytes += len;
                this._pushSession._outBytes += len;
            }
            else if (this._transType == 'udp' && this._vRTPClientSocket) {
                this._vRTPClientSocket.send(rtpBuf, this._vRTPClientPort, this._host);
                this._outBytes += rtpBuf.length;
                this._pushSession._outBytes += rtpBuf.length;
            }
        }
    }
    _sendVideo(rtpBuf) {
        if (this._transType == 'tcp') {
            const len = rtpBuf.length + 4;
            const headerBuf = Buffer.allocUnsafe(4);
            headerBuf.writeUInt8(0x24, 0);
            headerBuf.writeUInt8(this._vRTPChannel, 1);
            headerBuf.writeUInt16BE(rtpBuf.length, 2);
            this._socket.write(Buffer.concat([headerBuf, rtpBuf], len));
            this._outBytes += len;
            this._pushSession._outBytes += len;
        }
        else if (this._transType == 'udp' && this._vRTPClientSocket) {
            this._vRTPClientSocket.send(rtpBuf, this._vRTPClientPort, this._host);
            this._outBytes += rtpBuf.length;
            this._pushSession._outBytes += rtpBuf.length;
        }
    }
    _broadcastVideo(rtpBuf) {
        if (this._waitNextIframe) {
            return;
        }
        for (const sid in this._playSessions) {
            this._playSessions[sid]._sendVideo(rtpBuf);
        }
        if (Object.keys(this._playSessions).length === 0) {
            if (Date.now() - this._lastUnsubscribeAt > 30000) {
                this._socket.destroy();
            }
        }
    }
    _sendVideoControl(rtpBuf) {
        if (this._transType == 'tcp') {
            const len = rtpBuf.length + 4;
            const headerBuf = Buffer.allocUnsafe(4);
            headerBuf.writeUInt8(0x24, 0);
            headerBuf.writeUInt8(this._vRTPControlChannel, 1);
            headerBuf.writeUInt16BE(rtpBuf.length, 2);
            this._socket.write(Buffer.concat([headerBuf, rtpBuf], len));
            this._outBytes += len;
            this._pushSession._outBytes += len;
        }
        else if (this._transType == 'udp' && this._vRTPControlClientSocket) {
            this._vRTPControlClientSocket.send(rtpBuf, this._vRTPControlClientPort, this._host);
            this._outBytes += rtpBuf.length;
            this._pushSession._outBytes += rtpBuf.length;
        }
    }
    _broadcastVideoControl(rtpBuf) {
        for (const sid in this._playSessions) {
            this._playSessions[sid]._sendVideoControl(rtpBuf);
        }
    }
    _sendAudio(rtpBuf) {
        if (this._transType == 'tcp') {
            const len = rtpBuf.length + 4;
            const headerBuf = Buffer.allocUnsafe(4);
            headerBuf.writeUInt8(0x24, 0);
            headerBuf.writeUInt8(this._aRTPChannel, 1);
            headerBuf.writeUInt16BE(rtpBuf.length, 2);
            this._socket.write(Buffer.concat([headerBuf, rtpBuf], len));
            this._outBytes += len;
            this._pushSession._outBytes += len;
        }
        else if (this._transType == 'udp' && this._aRTPClientSocket) {
            this._aRTPClientSocket.send(rtpBuf, this._aRTPClientPort, this._host);
            this._outBytes += rtpBuf.length;
            this._pushSession._outBytes += rtpBuf.length;
        }
    }
    _broadcastAudio(rtpBuf) {
        if (this._waitNextIframe) {
            return;
        }
        for (const sid in this._playSessions) {
            this._playSessions[sid]._sendAudio(rtpBuf);
        }
    }
    _sendAudioControl(rtpBuf) {
        if (this._transType == 'tcp') {
            const len = rtpBuf.length + 4;
            const headerBuf = Buffer.allocUnsafe(4);
            headerBuf.writeUInt8(0x24, 0);
            headerBuf.writeUInt8(this._aRTPControlChannel, 1);
            headerBuf.writeUInt16BE(rtpBuf.length, 2);
            this._socket.write(Buffer.concat([headerBuf, rtpBuf], len));
            this._outBytes += len;
            this._pushSession._outBytes += len;
        }
        else if (this._transType == 'udp' && this._aRTPControlClientSocket) {
            this._aRTPControlClientSocket.send(rtpBuf, this._aRTPControlClientPort, this._host);
            this._outBytes += rtpBuf.length;
            this._pushSession._outBytes += rtpBuf.length;
        }
    }
    _broadcastAudioControl(rtpBuf) {
        for (const sid in this._playSessions) {
            this._playSessions[sid]._sendAudioControl(rtpBuf);
        }
    }
    _bindUDPPort(socket, port) {
        return new Promise((resolve) => {
            socket.bind(port, () => {
                resolve();
            });
        });
    }
}
exports.RtspSession = RtspSession;
//# sourceMappingURL=RtspSession.js.map