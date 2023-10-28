"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaluDecoder = void 0;
class NaluDecoder {
    _getNaluStart(frame, startAt) {
        const length = frame.length;
        for (let index = startAt; index < length - 4; index++) {
            if (frame[index] === 0x00 &&
                frame[index + 1] === 0x00 &&
                frame[index + 2] === 0x00 &&
                frame[index + 3] === 0x01) {
                return index;
            }
        }
        return -1;
    }
    getNaluRange(frame, startAt) {
        const startNalu = this._getNaluStart(frame, startAt);
        const endNalu = this._getNaluStart(frame, startNalu + 4);
        return [startNalu, endNalu];
    }
}
exports.NaluDecoder = NaluDecoder;
exports.default = new NaluDecoder();
//# sourceMappingURL=NaluDecoder.js.map