"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferPool = void 0;
const stream_1 = require("stream");
class BufferPool extends stream_1.Readable {
    constructor(_gFun) {
        super();
        this._gFun = _gFun;
        this._poolBytes = 0;
        this._needBytes = 0;
    }
    init() {
        this._gFun.next(false);
    }
    _read() {
    }
    stop() {
        try {
            this._gFun.next(true);
        }
        catch (e) {
            console.log(e);
        }
    }
    push(buf) {
        super.push(buf);
        this._poolBytes += buf.length;
        if (this._needBytes > 0 && this._needBytes <= this._poolBytes) {
            this._gFun.next(false);
        }
        return true;
    }
    read(size) {
        this._poolBytes -= size;
        return super.read(size);
    }
    need(size) {
        const ret = this._poolBytes < size;
        if (ret) {
            this._needBytes = size;
        }
        else {
            this._needBytes = 0;
        }
        return ret;
    }
}
exports.BufferPool = BufferPool;
//# sourceMappingURL=BufferPool.js.map