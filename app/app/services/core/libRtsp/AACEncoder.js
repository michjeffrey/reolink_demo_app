"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AACEncoder = void 0;
const rtspEncoder_1 = require("./rtspEncoder");
const ADTS_LENGTH = 7;
const CRC_LENGTH = 2;
class AACEncoder {
    constructor(_baseTime, _ssrc) {
        this._baseTime = _baseTime;
        this._ssrc = _ssrc;
        this._frameIndex = 0;
        this._rtspEncoder = new rtspEncoder_1.RTSPEncoder();
    }
    _endcodeHeader(args) {
        const rtspBuffer = this._rtspEncoder.encodeRTSPHeaderBuffer('audio', args.frame.length + 12 + 4);
        const frameIndex = Math.ceil(args.videoTs * 16 / 1024);
        if (frameIndex <= this._frameIndex) {
            this._frameIndex++;
        }
        else {
            this._frameIndex = frameIndex;
        }
        const rtpBuffer = this._rtspEncoder.encodeRTPHeaderBuffer({
            'frameType': 'audio',
            'marker': true,
            'sequence': args.sequence,
            'ssrc': this._ssrc,
            'timeStamp': this._baseTime + this._frameIndex * 1024
        });
        const buffer = Buffer.alloc(4);
        const AU_HEADER_LENGTH = 0x10;
        buffer.writeUInt16BE(AU_HEADER_LENGTH, 0);
        buffer.writeUInt8((args.frame.length & 0x1fe0) >> 5, 2);
        buffer.writeUInt8((args.frame.length & 0x1f) << 3, 3);
        return Buffer.concat([rtspBuffer, rtpBuffer, buffer]);
    }
    encodeFrame(args) {
        let frame;
        if (args.frame[1] & 0x01) {
            frame = args.frame.subarray(ADTS_LENGTH);
        }
        else {
            frame = args.frame.subarray(ADTS_LENGTH + CRC_LENGTH);
        }
        return {
            'header': this._endcodeHeader({
                frame,
                'sequence': args.sequence,
                videoTs: args.videoTs
            }),
            'payload': frame
        };
    }
}
exports.AACEncoder = AACEncoder;
//# sourceMappingURL=AACEncoder.js.map