"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamDecoder = exports.StreamDirectDecoder = exports.streamTypeRecord = exports.EFrameType = exports.MAX_FRAME_LEN = void 0;
exports.MAX_FRAME_LEN = 10 * 1024 * 1024;
var EStreamDecodeState;
(function (EStreamDecodeState) {
    EStreamDecodeState[EStreamDecodeState["READ_AAC_HEADER"] = 0] = "READ_AAC_HEADER";
    EStreamDecodeState[EStreamDecodeState["READ_VIDEO_HEADER"] = 1] = "READ_VIDEO_HEADER";
    EStreamDecodeState[EStreamDecodeState["READ_FRAME_PAYLOAD"] = 2] = "READ_FRAME_PAYLOAD";
    EStreamDecodeState[EStreamDecodeState["READ_EXT_DATA"] = 3] = "READ_EXT_DATA";
    EStreamDecodeState[EStreamDecodeState["READ_FRAME_TAIL"] = 4] = "READ_FRAME_TAIL";
})(EStreamDecodeState || (EStreamDecodeState = {}));
var EFrameType;
(function (EFrameType) {
    EFrameType[EFrameType["IFRAME"] = 48] = "IFRAME";
    EFrameType[EFrameType["PFRAME"] = 49] = "PFRAME";
    EFrameType[EFrameType["AFRAME"] = 53] = "AFRAME";
    EFrameType[EFrameType["ENDFRAME"] = 255] = "ENDFRAME";
})(EFrameType = exports.EFrameType || (exports.EFrameType = {}));
exports.streamTypeRecord = {
    'I': 0x30,
    'P': 0x31,
    'A': 0x35,
    'EOF': 0xff
};
class StreamDirectDecoder {
    constructor() {
        this._frameStartMark = 'I';
        this._gotFirstFrameType = false;
        this._payload = [];
        this._payloadLength = 0;
    }
    push(buf, frameStartMark) {
        const retBuffers = [];
        if (frameStartMark === 'EOF') {
            retBuffers.push({
                'frameType': 0xff,
                'pts': 0,
                'payload': []
            });
            this._frameStartMark = frameStartMark;
            this._payload = [];
            this._payloadLength = 0;
            return retBuffers;
        }
        if (frameStartMark) {
            if (this._gotFirstFrameType) {
                retBuffers.push({
                    'frameType': exports.streamTypeRecord[this._frameStartMark],
                    'payload': this._payload,
                    'pts': 0,
                });
            }
            this._gotFirstFrameType = true;
            this._frameStartMark = frameStartMark;
            this._payload = [];
            this._payloadLength = 0;
        }
        this._payload.push(buf);
        this._payloadLength += buf.length;
        if (this._payloadLength >= exports.MAX_FRAME_LEN) {
            console.error('frame is max len 10MB, frameLength:', this._payloadLength);
            this._payload = [];
            this._payloadLength = 0;
        }
        return retBuffers;
    }
}
exports.StreamDirectDecoder = StreamDirectDecoder;
class StreamDecoder {
    constructor(_aacHeaderLength = 8, _aacPayloadLength = 4, _videoHeaderLength = 24, _videoPayloadLength = 8, _extDataLength = 12) {
        this._aacHeaderLength = _aacHeaderLength;
        this._aacPayloadLength = _aacPayloadLength;
        this._videoHeaderLength = _videoHeaderLength;
        this._videoPayloadLength = _videoPayloadLength;
        this._extDataLength = _extDataLength;
        this._state = EStreamDecodeState.READ_AAC_HEADER;
        this._headBufferLength = 0;
        this._extBufferLength = 0;
        this._tailBufferLength = 0;
        this._payloadBuffer = [];
        this._payloadBufferLength = 0;
        this._headerBuffer = Buffer.allocUnsafe(this._videoHeaderLength);
    }
    _readPayloadLength() {
        const frameType = this._headerBuffer.readUInt8(1);
        if (frameType === 0x30 || frameType === 0x31) {
            return this._headerBuffer.readUInt32LE(this._videoPayloadLength);
        }
        else {
            return this._headerBuffer.readUInt16LE(this._aacPayloadLength);
        }
    }
    _readExtLength() {
        return this._headerBuffer.readUint32LE(this._extDataLength);
    }
    push(buf) {
        const retBuffers = [];
        do {
            if (!buf.length) {
                return retBuffers;
            }
            if (this._state === EStreamDecodeState.READ_AAC_HEADER) {
                const copyLen = this._aacHeaderLength - this._headBufferLength;
                if (buf.length < copyLen) {
                    buf.copy(this._headerBuffer, this._headBufferLength, 0, buf.length);
                    this._headBufferLength += buf.length;
                    break;
                }
                else {
                    buf.copy(this._headerBuffer, this._headBufferLength, 0, copyLen);
                    this._headBufferLength += copyLen;
                    buf = buf.subarray(copyLen);
                    const frameType = this._headerBuffer.readUInt8(1);
                    if (frameType === 0x30 || frameType === 0x31) {
                        this._state = EStreamDecodeState.READ_VIDEO_HEADER;
                    }
                    else {
                        const payloadLength = this._readPayloadLength();
                        if (payloadLength === 0) {
                            retBuffers.push({
                                'payload': this._payloadBuffer,
                                'frameType': this._headerBuffer.readUInt8(1),
                                'pts': 0,
                            });
                            this._headBufferLength = 0;
                            continue;
                        }
                        this._state = EStreamDecodeState.READ_FRAME_PAYLOAD;
                        this._payloadBufferLength = 0;
                        this._payloadBuffer = [];
                    }
                }
            }
            else if (this._state === EStreamDecodeState.READ_VIDEO_HEADER) {
                const copyLen = this._videoHeaderLength - this._headBufferLength;
                if (buf.length < copyLen) {
                    buf.copy(this._headerBuffer, this._headBufferLength, 0, buf.length);
                    this._headBufferLength += buf.length;
                    break;
                }
                else {
                    buf.copy(this._headerBuffer, this._headBufferLength, 0, copyLen);
                    this._headBufferLength += copyLen;
                    buf = buf.subarray(copyLen);
                    this._payloadBufferLength = 0;
                    this._payloadBuffer = [];
                    const extLen = this._readExtLength();
                    if (!extLen) {
                        this._state = EStreamDecodeState.READ_FRAME_PAYLOAD;
                        this._payloadBufferLength = 0;
                        this._payloadBuffer = [];
                    }
                    else {
                        this._state = EStreamDecodeState.READ_EXT_DATA;
                        this._extBufferLength = 0;
                    }
                }
            }
            else if (this._state === EStreamDecodeState.READ_EXT_DATA) {
                const copyLen = this._readExtLength() - this._extBufferLength;
                if (buf.length < copyLen) {
                    this._extBufferLength += buf.length;
                    break;
                }
                else {
                    buf = buf.subarray(copyLen);
                    this._state = EStreamDecodeState.READ_FRAME_PAYLOAD;
                    this._payloadBufferLength = 0;
                    this._payloadBuffer = [];
                }
            }
            else if (this._state === EStreamDecodeState.READ_FRAME_PAYLOAD) {
                const payloadLength = this._readPayloadLength();
                const copyLen = payloadLength - this._payloadBufferLength;
                if (buf.length < copyLen) {
                    if (buf.length) {
                        this._payloadBuffer.push(buf);
                        this._payloadBufferLength += buf.length;
                    }
                    break;
                }
                else {
                    if (copyLen > 0) {
                        this._payloadBuffer.push(buf.subarray(0, copyLen));
                        buf = buf.subarray(copyLen);
                    }
                    retBuffers.push({
                        'payload': this._payloadBuffer,
                        'frameType': this._headerBuffer.readUInt8(1),
                        'pts': Number(this._headerBuffer.readBigUInt64LE(16)),
                    });
                    if (payloadLength % 8 === 0) {
                        this._state = EStreamDecodeState.READ_AAC_HEADER;
                        this._headBufferLength = 0;
                    }
                    else {
                        this._state = EStreamDecodeState.READ_FRAME_TAIL;
                        this._tailBufferLength = 0;
                    }
                }
            }
            else {
                const payloadLength = this._readPayloadLength();
                const copyLen = 8 - (payloadLength % 8) - this._tailBufferLength;
                if (buf.length < copyLen) {
                    this._tailBufferLength += buf.length;
                    break;
                }
                else {
                    buf = buf.subarray(copyLen);
                    this._state = EStreamDecodeState.READ_AAC_HEADER;
                    this._headBufferLength = 0;
                }
            }
        } while (true);
        return retBuffers;
    }
}
exports.StreamDecoder = StreamDecoder;
//# sourceMappingURL=StreamDecoder.js.map