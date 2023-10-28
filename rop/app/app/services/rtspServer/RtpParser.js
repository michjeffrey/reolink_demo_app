"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtpParser = void 0;
const FIXED_HEADER_LENGTH = 12;
class RtpParser {
    parseRtpPacket(buf) {
        if (buf.length < FIXED_HEADER_LENGTH) {
            throw new Error('can not parse buffer smaller than fixed header');
        }
        const firstByte = buf.readUInt8(0);
        const secondByte = buf.readUInt8(1);
        const version = firstByte >> 6;
        const padding = (firstByte >> 5) & 1;
        const extension = (firstByte >> 4) & 1;
        const csrcCount = firstByte & 0x0f;
        const marker = secondByte >> 7;
        const payloadType = secondByte & 0x7f;
        const sequenceNumber = buf.readUInt16BE(2);
        const timestamp = buf.readUInt32BE(4);
        const ssrc = buf.readUInt32BE(8);
        let offset = FIXED_HEADER_LENGTH;
        let end = buf.length;
        if (end - offset >= 4 * csrcCount) {
            offset += 4 * csrcCount;
        }
        else {
            console.log('no enough space for csrc');
        }
        if (extension) {
            if (end - offset >= 4) {
                const extLen = 4 * (buf.readUInt16BE(offset + 2));
                offset += 4;
                if (end - offset >= extLen) {
                    offset += extLen;
                }
                else {
                    console.log('no enough space for extension data');
                }
            }
            else {
                console.log('no enough space for extension header');
            }
        }
        if (padding) {
            if (end - offset > 0) {
                const paddingBytes = buf.readUInt8(end - 1);
                if (end - offset >= paddingBytes) {
                    end -= paddingBytes;
                }
            }
        }
        const parsed = {
            version: version,
            padding: padding,
            extension: extension,
            csrcCount: csrcCount,
            marker: marker,
            payloadType: payloadType,
            sequenceNumber: sequenceNumber,
            timestamp: timestamp,
            ssrc: ssrc,
            payload: buf.subarray(offset, end)
        };
        return parsed;
    }
    isKeyframeStart(rtpRawdata, encodeType) {
        if (encodeType === 'H264') {
            if ((rtpRawdata[0] & 0x1f) === 7) {
                return true;
            }
        }
        else if (encodeType === 'H265') {
            if (((rtpRawdata[0] >> 1) & 0x3f) === 32) {
                return true;
            }
        }
        return false;
    }
}
exports.RtpParser = RtpParser;
//# sourceMappingURL=RtpParser.js.map