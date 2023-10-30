"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreDecoder = void 0;
var EDecodeState;
(function (EDecodeState) {
    EDecodeState[EDecodeState["READ_HEADER"] = 0] = "READ_HEADER";
    EDecodeState[EDecodeState["READ_BODY"] = 1] = "READ_BODY";
})(EDecodeState || (EDecodeState = {}));
class CoreDecoder {
    constructor(_headerLength, _dataLengthPos, _dataLenSize) {
        this._headerLength = _headerLength;
        this._dataLengthPos = _dataLengthPos;
        this._dataLenSize = _dataLenSize;
        this._state = EDecodeState.READ_HEADER;
        this._headerBufferLength = 0;
        this._payloadBuffer = [];
        this._payloadBufferLength = 0;
        this._headerBuffer = Buffer.allocUnsafe(this._headerLength);
    }
    _readDataLength() {
        if (this._dataLenSize === 4) {
            this._headerBuffer.readUInt32LE(this._dataLengthPos);
        }
        return this._headerBuffer.readUInt16LE(this._dataLengthPos);
    }
    push(buf) {
        const retBuffer = [];
        do {
            if (!buf.length) {
                return retBuffer;
            }
            if (this._state === EDecodeState.READ_HEADER) {
                const copyLen = this._headerLength - this._headerBufferLength;
                if (buf.length < copyLen) {
                    buf.copy(this._headerBuffer, this._headerBufferLength, 0, buf.length);
                    this._headerBufferLength += buf.length;
                    break;
                }
                else {
                    buf.copy(this._headerBuffer, this._headerBufferLength, 0, copyLen);
                    buf = buf.subarray(copyLen);
                    this._payloadBufferLength = 0;
                    this._payloadBuffer = [];
                    const dataLength = this._readDataLength();
                    if (dataLength === 0) {
                        retBuffer.push({
                            'header': Buffer.from(this._headerBuffer),
                            'payload': []
                        });
                        this._headerBufferLength = 0;
                    }
                    else {
                        this._state = EDecodeState.READ_BODY;
                    }
                }
            }
            else {
                const dataLength = this._readDataLength();
                const copyLen = dataLength - this._payloadBufferLength;
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
                    retBuffer.push({
                        'header': Buffer.from(this._headerBuffer),
                        'payload': this._payloadBuffer
                    });
                    this._headerBufferLength = 0;
                    this._state = EDecodeState.READ_HEADER;
                }
            }
        } while (true);
        return retBuffer;
    }
}
exports.CoreDecoder = CoreDecoder;
//# sourceMappingURL=CoreDecoder.js.map