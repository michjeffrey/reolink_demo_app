"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.H265Encoder = void 0;
const rtspEncoder_1 = require("./rtspEncoder");
const NaluDecoder_1 = __importDefault(require("./NaluDecoder"));
const MTU = 1420;
class H265Encoder {
    constructor(_frameRate, _baseTime, _ssrc) {
        this._frameRate = _frameRate;
        this._baseTime = _baseTime;
        this._ssrc = _ssrc;
        console.log('frameRate:', this._frameRate);
        this._rtspEncoder = new rtspEncoder_1.RTSPEncoder();
        this._buffer = Buffer.allocUnsafe(3);
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
        const rtspBuffer = this._rtspEncoder.encodeRTSPHeaderBuffer('video', args.frame.length + 12 + 3);
        const rtpBuffer = this._rtspEncoder.encodeRTPHeaderBuffer({
            'frameType': 'video',
            'marker': se === 0x40,
            'sequence': args.sequence,
            'ssrc': this._ssrc,
            timeStamp
        });
        this._buffer.writeUInt8(args.fType, 0);
        this._buffer.writeUInt8(1, 1);
        this._buffer.writeUInt8(se + args.fuType, 2);
        return {
            'header': Buffer.concat([rtspBuffer, rtpBuffer, this._buffer]),
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
        const [startVPS, endVPS] = NaluDecoder_1.default.getNaluRange(firstBuffer, 0);
        const [startPPS, endPPS] = NaluDecoder_1.default.getNaluRange(firstBuffer, endVPS);
        const [startSPS, endSPS] = NaluDecoder_1.default.getNaluRange(firstBuffer, endPPS);
        const frameSPS = firstBuffer.subarray(startVPS + 4, endVPS);
        rtpPackets.push(this.encodeSingleFrame(frameSPS, args.sequence, args.ts));
        args.sequence++;
        const framePPS = firstBuffer.subarray(startPPS + 4, endPPS);
        rtpPackets.push(this.encodeSingleFrame(framePPS, args.sequence, args.ts));
        args.sequence++;
        const frameVPS = firstBuffer.subarray(startSPS + 4, endSPS);
        rtpPackets.push(this.encodeSingleFrame(frameVPS, args.sequence, args.ts));
        args.sequence++;
        args.rawFrame[0] = firstBuffer.subarray(endSPS);
        rtpPackets.push(...this.encodeframe(args));
        return rtpPackets;
    }
    encodeFUFrameWithCopy(rawFrame, sequence, ts) {
        const timeStamp = this._baseTime + ts * 90;
        const frame = Buffer.concat(rawFrame);
        let pos = 0;
        const fType = 0x31 << 1;
        const fuType = (frame[4] >> 1) & 0x3f;
        pos += 4;
        const rtpPackets = [];
        rtpPackets.push(this._encodeFUHeadPacket({
            fType,
            fuType,
            sequence,
            'timeStamp': timeStamp,
            'frame': frame.subarray(pos + 2, MTU),
            ts
        }));
        pos = MTU;
        do {
            if (frame.length > pos + MTU) {
                rtpPackets.push(this._encodeFUMidPacket({
                    fType,
                    fuType,
                    'sequence': sequence + rtpPackets.length,
                    'timeStamp': timeStamp,
                    'frame': frame.subarray(pos, pos + MTU),
                    ts
                }));
            }
            else {
                rtpPackets.push(this._encodeFUTailPacket({
                    fType,
                    fuType,
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
        const fType = 0x31 << 1;
        const fuType = (frameHead[0] >> 1) & 0x3f;
        const rtpPackets = [];
        rtpPackets.push(this._encodeFUHeadPacket({
            fType,
            fuType,
            sequence,
            'timeStamp': timeStamp,
            'frame': frameHead.subarray(2, MTU),
            ts
        }));
        rawFrame[0] = frameHead.subarray(MTU);
        for (let index = 0; index < rawFrame.length; index++) {
            let pos = 0;
            const frame = rawFrame[index];
            do {
                if (frame.length > pos + MTU) {
                    rtpPackets.push(this._encodeFUMidPacket({
                        fType,
                        fuType,
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
                            fType,
                            fuType,
                            'sequence': sequence + rtpPackets.length,
                            'timeStamp': timeStamp,
                            'frame': frame.subarray(pos),
                            ts
                        }));
                    }
                    else {
                        rtpPackets.push(this._encodeFUMidPacket({
                            fType,
                            fuType,
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
exports.H265Encoder = H265Encoder;
//# sourceMappingURL=H265Encoder.js.map