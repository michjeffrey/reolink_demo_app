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
exports.StreamPusher = void 0;
const net = __importStar(require("net"));
const StreamDecoder_1 = require("../core/StreamDecoder");
const AACEncoder_1 = require("../core/libRtsp/AACEncoder");
const H264Encoder_1 = require("../core/libRtsp/H264Encoder");
const H265Encoder_1 = require("../core/libRtsp/H265Encoder");
const Base_1 = require("../core/Base");
class StreamPusher {
    constructor(_pushURL, _frameRate, _rtspServerPort, _uid, _requestId, _videoCodec, _onPusherClose, _hasEnd) {
        this._pushURL = _pushURL;
        this._frameRate = _frameRate;
        this._rtspServerPort = _rtspServerPort;
        this._uid = _uid;
        this._requestId = _requestId;
        this._videoCodec = _videoCodec;
        this._onPusherClose = _onPusherClose;
        this._hasEnd = _hasEnd;
        this._firstIframeFound = false;
        this._cseq = 0;
        this._pts = 0;
        this._lastVideoTs = 0;
        this._ssrc = 0;
        this._ssrc = Math.floor(Math.random() * 1000000);
        this._sequence = Math.floor(Math.random() * 10000);
        this._aacEncoder = new AACEncoder_1.AACEncoder(Math.floor(Math.random() * 1000000), this._ssrc);
        if (this._videoCodec === Base_1.EVideoCodec.H264) {
            this._videoEncoder = new H264Encoder_1.H264Encoder(this._frameRate, Math.floor(Math.random() * 1000000), this._ssrc);
        }
        else {
            this._videoEncoder = new H265Encoder_1.H265Encoder(this._frameRate, Math.floor(Math.random() * 1000000), this._ssrc);
        }
    }
    _getSDP() {
        let videoCodec = 'H264';
        if (this._videoCodec === 1) {
            videoCodec = 'H265';
        }
        return `v=0
o=- 12345 12345 IN IP4 0.0.0.0
s=ROP Streaming Media
i=ROP Streaming Media
t=0 0
a=tool:ROP Streaming Media
a=control:*
m=video 0 RTP/AVP 96
c=IN IP4 0.0.0.0
b=AS:500
a=framerate:${this._frameRate}.000000
a=rtpmap:96 ${videoCodec}/90000
a=fmtp:96 packetization-mode=1;profile-level-id=640033;sprop-parameter-sets=Z2QAM6zoCgPZ,aO48sA==
a=control:track1
m=audio 0 RTP/AVP 97
c=IN IP4 0.0.0.0
a=rtpmap:97 MPEG4-GENERIC/16000
a=fmtp:97 streamtype=5;profile-level-id=1;mode=AAC-hbr;sizelength=13;indexlength=3;indexdeltalength=3;config=1408; profile=1;
a=control:track2
`;
    }
    connectRtspServer() {
        const pushHost = '127.0.0.1';
        this._rtspSocket = net.connect(this._rtspServerPort, pushHost);
        return new Promise((resolve, reject) => {
            this._rtspSocket.on('connect', () => {
                resolve();
            });
            this._rtspSocket.on('error', (e) => {
                this._rtspSocket.destroy();
                reject(e);
            });
            this._rtspSocket.on('close', () => {
                this._onPusherClose(this._uid, this._requestId);
            });
            this._rtspSocket.on('timeout', () => {
                this._rtspSocket.end();
            });
        });
    }
    async announceStream() {
        await this._sendAnnounce();
        await this._sendSetupVideo();
        await this._sendSetupAudio();
        await this._sendRecord();
    }
    _sendAnnounce() {
        const sdp = this._getSDP();
        return new Promise((resolve) => {
            this._rtspSocket.write(`ANNOUNCE ${this._pushURL} RTSP/1.0\r\n`);
            this._rtspSocket.write(`CSeq: ${++this._cseq}\r\n`);
            this._rtspSocket.write('User-Agent: ROP Streaming Media\r\n');
            this._rtspSocket.write('Content-Type: application/sdp\r\n');
            this._rtspSocket.write(`Content-Length: ${Buffer.from(sdp).byteLength}\r\n`);
            this._rtspSocket.write('\r\n');
            this._rtspSocket.write(Buffer.from(sdp), () => {
                resolve();
            });
        });
    }
    _sendSetupVideo() {
        return new Promise((resolve) => {
            this._rtspSocket.write(`SETUP ${this._pushURL}/track1 RTSP/1.0\r\n`);
            this._rtspSocket.write(`CSeq: ${++this._cseq}\r\n`);
            this._rtspSocket.write('User-Agent: ROP Streaming Media\r\n');
            this._rtspSocket.write('Transport: RTP/AVP/TCP;unicast;mode=receive;interleaved=0-1\r\n');
            this._rtspSocket.write('\r\n', () => {
                resolve();
            });
        });
    }
    _sendSetupAudio() {
        return new Promise((resolve) => {
            this._rtspSocket.write(`SETUP ${this._pushURL}/track2 RTSP/1.0\r\n`);
            this._rtspSocket.write(`CSeq: ${++this._cseq}\r\n`);
            this._rtspSocket.write('User-Agent: ROP Streaming Media\r\n');
            this._rtspSocket.write('Transport: RTP/AVP/TCP;unicast;mode=receive;interleaved=2-3\r\n');
            this._rtspSocket.write('\r\n', () => {
                resolve();
            });
        });
    }
    _sendRecord() {
        return new Promise((resolve) => {
            this._rtspSocket.write(`RECORD ${this._pushURL}/track1 RTSP/1.0\r\n`);
            this._rtspSocket.write(`CSeq: ${++this._cseq}\r\n`);
            this._rtspSocket.write('User-Agent: ROP Streaming Media\r\n');
            this._rtspSocket.write('\r\n', () => {
                resolve();
            });
        });
    }
    _sendOutRtpPackets(rtpPackets) {
        for (const rtpPacket of rtpPackets) {
            this._rtspSocket.write(rtpPacket.header);
            this._rtspSocket.write(rtpPacket.payload);
        }
        this._sequence += rtpPackets.length;
    }
    pushStream(items) {
        for (const item of items) {
            if (item.frameType === StreamDecoder_1.EFrameType.IFRAME && !this._firstIframeFound) {
                this._firstIframeFound = true;
                this._pts = item.pts;
            }
            if (!this._firstIframeFound) {
                console.error('not found iframe,frameType:', item.frameType);
                continue;
            }
            if (item.frameType === StreamDecoder_1.EFrameType.IFRAME) {
                const ts = (item.pts - this._pts) / 1000;
                this._lastVideoTs = ts;
                this._sendOutRtpPackets(this._videoEncoder.encodeIframe({
                    'rawFrame': item.payload,
                    'sequence': this._sequence,
                    ts
                }));
            }
            else if (item.frameType === StreamDecoder_1.EFrameType.PFRAME) {
                const ts = (item.pts - this._pts) / 1000;
                this._lastVideoTs = ts;
                this._sendOutRtpPackets(this._videoEncoder.encodeframe({
                    'rawFrame': item.payload,
                    'sequence': this._sequence,
                    ts
                }));
            }
            else if (item.frameType === StreamDecoder_1.EFrameType.AFRAME) {
                const packets = [this._aacEncoder.encodeFrame({
                        'frame': Buffer.concat(item.payload),
                        'sequence': this._sequence,
                        'videoTs': this._lastVideoTs
                    })];
                this._sendOutRtpPackets(packets);
            }
            else {
                if (this._hasEnd) {
                    console.error('found end frame,frameType:', item.frameType);
                    this.stop();
                }
                else {
                    console.error('found error frame,frameType:', item.frameType);
                }
            }
        }
    }
    stop() {
        if (this._rtspSocket) {
            this._rtspSocket.destroy();
        }
    }
}
exports.StreamPusher = StreamPusher;
//# sourceMappingURL=StreamPusher.js.map