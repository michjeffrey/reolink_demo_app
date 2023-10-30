"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTSPEncoder = void 0;
class RTSPEncoder {
    encodeRTSPHeader(frameType, dataLength) {
        let channel = 0x00;
        if (frameType === 'audio') {
            channel = 0x02;
        }
        else {
            channel = 0x00;
        }
        return {
            magic: 0x24,
            channel,
            dataLength
        };
    }
    encodeRTSPHeaderBuffer(frameType, dataLength) {
        const header = this.encodeRTSPHeader(frameType, dataLength);
        const buffer = Buffer.alloc(4);
        buffer.writeUInt8(header.magic, 0);
        buffer.writeUInt8(header.channel, 1);
        buffer.writeUInt16BE(header.dataLength, 2);
        return buffer;
    }
    encodeRTPHeaderBuffer(args) {
        const buffer = Buffer.alloc(12);
        const header = this.encodeRTPHeader(args);
        buffer.writeUInt8(header.vpxcc, 0);
        buffer.writeUInt8(header.mpt, 1);
        buffer.writeUInt16BE(header.sequence % 65536, 2);
        buffer.writeUInt32BE(header.timeStamp % 4294967296, 4);
        buffer.writeUInt32BE(header.ssrc, 8);
        return buffer;
    }
    encodeRTPHeader(args) {
        let mpt = 0;
        if (args.marker) {
            mpt += 0x80;
        }
        if (args.frameType === 'audio') {
            mpt += 0x61;
        }
        else {
            mpt += 0x60;
        }
        return {
            vpxcc: 0x80,
            timeStamp: args.timeStamp,
            sequence: args.sequence,
            mpt,
            ssrc: args.ssrc
        };
    }
}
exports.RTSPEncoder = RTSPEncoder;
//# sourceMappingURL=rtspEncoder.js.map