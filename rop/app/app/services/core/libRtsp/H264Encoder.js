"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.H264Encoder = void 0;
const rtspEncoder_1 = require("./rtspEncoder");
const NaluDecoder_1 = __importDefault(require("./NaluDecoder"));
const MTU = 1420;
class H264Encoder {
    constructor(_frameRate, _baseTime, _ssrc) {
        this._frameRate = _frameRate;
        this._baseTime = _baseTime;
        this._ssrc = _ssrc;
        console.log('frameRate:', this._frameRate);
        this._rtspEncoder = new rtspEncoder_1.RTSPEncoder();
    }
    encodeSingleFrame(frame, sequence, ts) {
        const timeStamp = this._baseTime + ts * 90;
        const rtspBuffer = this._rtspEncoder.encodeRTSPHeaderBuffer('video', frame.length + 12);
        const rtpBuffer = this._rtspEncoder.encodeRTPHeaderBuffer({
            'frameType': 'video',
            'marker': true,
            sequence,
            'ssrc': this._ssrc,
            timeStamp
        });
        return {
            'header': Buffer.concat([rtspBuffer, rtpBuffer]),
            'payload': frame
        };
    }
    _encodeFUPacket(args, se, ts) {
        const timeStamp = this._baseTime + ts * 90;
        const rtspBuffer = this._rtspEncoder.encodeRTSPHeaderBuffer('video', args.frame.length + 12 + 2);
        const rtpBuffer = this._rtspEncoder.encodeRTPHeaderBuffer({
            'frameType': 'video',
            'marker': se === 0x40,
            'sequence': args.sequence,
            'ssrc': this._ssrc,
            timeStamp
        });
        const buffer = Buffer.alloc(2);
        const fuType = 0x1c;
        buffer.writeUInt8(args.fNRI + fuType, 0);
        buffer.writeUInt8(se + args.frameType, 1);
        return {
            'header': Buffer.concat([rtspBuffer, rtpBuffer, buffer]),
            'payload': args.frame
        };
    }
    _encodeFUHeadPacket(args) {
        return this._encodeFUPacket(args, 0x80, args.ts);
    }
    _encodeFUMidPacket(args) {
        return this._encodeFUPacket(args, 0, args.ts);
    }
    _encodeFUTailPacket(args) {
        return this._encodeFUPacket(args, 0x40, args.ts);
    }
    encodeIframe(args) {
        if (args.rawFrame.length === 0) {
            return [];
        }
        const rtpPackets = [];
        const firstBuffer = args.rawFrame[0];
        const [startSPS, endSPS] = NaluDecoder_1.default.getNaluRange(firstBuffer, 0);
        const [startPPS, endPPS] = NaluDecoder_1.default.getNaluRange(firstBuffer, endSPS);
        const frameSPS = firstBuffer.subarray(startSPS + 4, endSPS);
        rtpPackets.push(this.encodeSingleFrame(frameSPS, args.sequence, args.ts));
        args.sequence++;
        const framePPS = firstBuffer.subarray(startPPS + 4, endPPS);
        rtpPackets.push(this.encodeSingleFrame(framePPS, args.sequence, args.ts));
        args.sequence++;
        args.rawFrame[0] = firstBuffer.subarray(endPPS);
        rtpPackets.push(...this.encodeframe(args));
        return rtpPackets;
    }
    encodeFUFrameWithCopy(rawFrame, sequence, ts) {
        const timeStamp = this._baseTime + ts * 90;
        const frame = Buffer.concat(rawFrame);
        let pos = 0;
        const fNRI = frame[4] & 0xe0;
        const frameType = frame[4] & 0x1f;
        pos += 4;
        const rtpPackets = [];
        rtpPackets.push(this._encodeFUHeadPacket({
            fNRI,
            frameType,
            sequence,
            'timeStamp': timeStamp,
            'frame': frame.subarray(pos + 1, MTU),
            ts
        }));
        pos = MTU;
        do {
            if (frame.length > pos + MTU) {
                rtpPackets.push(this._encodeFUMidPacket({
                    fNRI,
                    frameType,
                    'sequence': sequence + rtpPackets.length,
                    'timeStamp': timeStamp,
                    'frame': frame.subarray(pos, pos + MTU),
                    ts
                }));
            }
            else {
                rtpPackets.push(this._encodeFUTailPacket({
                    fNRI,
                    frameType,
                    'sequence': sequence + rtpPackets.length,
                    'timeStamp': timeStamp,
                    'frame': frame.subarray(pos),
                    ts
                }));
                break;
            }
            pos += MTU;
        } while (true);
        return rtpPackets;
    }
    encodeFUFrame(rawFrame, sequence, ts) {
        const timeStamp = this._baseTime + ts * 90;
        const frameHead = rawFrame[0].subarray(4);
        const fNRI = frameHead[0] & 0xe0;
        const frameType = frameHead[0] & 0x1f;
        const rtpPackets = [];
        rtpPackets.push(this._encodeFUHeadPacket({
            fNRI,
            frameType,
            sequence,
            'timeStamp': timeStamp,
            'frame': frameHead.subarray(1, MTU),
            ts
        }));
        rawFrame[0] = frameHead.subarray(MTU);
        for (let index = 0; index < rawFrame.length; index++) {
            let pos = 0;
            const frame = rawFrame[index];
            do {
                if (frame.length > pos + MTU) {
                    rtpPackets.push(this._encodeFUMidPacket({
                        fNRI,
                        frameType,
                        'sequence': sequence + rtpPackets.length,
                        'timeStamp': timeStamp,
                        'frame': frame.subarray(pos, pos + MTU),
                        ts
                    }));
                    pos = pos + MTU;
                }
                else {
                    if (index === rawFrame.length - 1) {
                        rtpPackets.push(this._encodeFUTailPacket({
                            fNRI,
                            frameType,
                            'sequence': sequence + rtpPackets.length,
                            'timeStamp': timeStamp,
                            'frame': frame.subarray(pos),
                            ts
                        }));
                    }
                    else {
                        rtpPackets.push(this._encodeFUMidPacket({
                            fNRI,
                            frameType,
                            'sequence': sequence + rtpPackets.length,
                            'timeStamp': timeStamp,
                            'frame': frame.subarray(pos),
                            ts
                        }));
                    }
                    break;
                }
            } while (true);
        }
        return rtpPackets;
    }
    encodeframe(args) {
        if (args.rawFrame.length === 0) {
            return [];
        }
        if (args.rawFrame.length === 1 && args.rawFrame[0].length <= MTU) {
            return [this.encodeSingleFrame(args.rawFrame[0].subarray(4), args.sequence, args.ts)];
        }
        return this.encodeFUFrame(args.rawFrame, args.sequence, args.ts);
    }
}
exports.H264Encoder = H264Encoder;
//# sourceMappingURL=H264Encoder.js.map