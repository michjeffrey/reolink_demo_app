"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitField32Template = exports.Accalculator = exports.randomIntegerBetween = exports.randomBetween = exports.formatDataSize = exports.isRangeIntersected = exports.range = void 0;
const DATA_UNITS = ['Byte', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
function range(start, end) {
    const ret = Array(end - start + 1);
    for (let i = 0; start <= end; i++, start++) {
        ret[i] = start;
    }
    return ret;
}
exports.range = range;
function isRangeIntersected(a, b) {
    if (a[0] > a[1]) {
        a = [a[1], a[0]];
    }
    if (b[0] > b[1]) {
        b = [b[1], b[0]];
    }
    return (b[0] <= a[0] && a[0] <= b[1])
        || (b[0] <= a[1] && a[1] <= b[1])
        || (a[0] <= b[0] && b[0] <= a[1])
        || (a[0] <= b[1] && b[1] <= a[1]);
}
exports.isRangeIntersected = isRangeIntersected;
function formatDataSize(bytes, acc = 2) {
    let i = 0;
    while (bytes >= 1024) {
        i++;
        bytes /= 1024.0;
    }
    return {
        'size': bytes > 0 ? bytes.toFixed(acc) : (0).toFixed(acc),
        'unit': DATA_UNITS[i]
    };
}
exports.formatDataSize = formatDataSize;
function randomBetween(min, max) {
    if (max < min) {
        [min, max] = [max, min];
    }
    return (max - min) * Math.random() + min;
}
exports.randomBetween = randomBetween;
function randomIntegerBetween(min, max) {
    if (max < min) {
        [min, max] = [max, min];
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor((max - min) * Math.random() + min);
}
exports.randomIntegerBetween = randomIntegerBetween;
class Accalculator {
    constructor(finalAccuracy = 2, extendedAccuracy = 2) {
        this.finalAccuracy = finalAccuracy;
        this.extendedAccuracy = extendedAccuracy;
    }
    _toFloat(a) {
        return typeof a === 'number' ? a : parseFloat(a);
    }
    protect(value) {
        return this._toFloat(value).toFixed(this.finalAccuracy + this.extendedAccuracy);
    }
    finalize(value) {
        return this._toFloat(value).toFixed(this.finalAccuracy);
    }
    add(a, b) {
        return this.protect(this._toFloat(a) + this._toFloat(b));
    }
    mul(a, b) {
        return this.protect(this._toFloat(a) * this._toFloat(b));
    }
    div(a, b) {
        return this.protect(this._toFloat(a) / this._toFloat(b));
    }
}
exports.Accalculator = Accalculator;
class BitField32Template {
    constructor(_opts) {
        this._opts = _opts;
        this._fields = {};
        for (const key in this._opts) {
            this._register(key, _opts[key].bitOffset, _opts[key].bitWidth);
        }
    }
    create(value = 0) {
        return new BitField32(this._fields, value);
    }
    _register(name, bitOffset, bitWidth = 1) {
        const maxBitOffset = bitOffset + bitWidth - 1;
        if (this._fields[name]) {
            throw new ReferenceError(`The bit named '${name}' has been registered.`);
        }
        if (!Number.isInteger(bitOffset) ||
            !Number.isInteger(maxBitOffset) ||
            bitOffset < 0 || bitOffset > 31 ||
            maxBitOffset < 0 || maxBitOffset > 31 ||
            maxBitOffset < bitOffset) {
            throw new RangeError(`The bit field [${bitOffset}, ${maxBitOffset}] is invalid.`);
        }
        for (const key in this._fields) {
            const sec = this._fields[key];
            if (isRangeIntersected([sec.lb, sec.mb], [bitOffset, maxBitOffset])) {
                throw new ReferenceError(`The bit field [${bitOffset}, ${maxBitOffset}] has been registered.`);
            }
        }
        const rangeMask = (1 << (maxBitOffset - bitOffset + 1)) - 1;
        this._fields[name] = {
            'mb': maxBitOffset,
            'lb': bitOffset,
            'fieldMask': rangeMask << bitOffset,
            'rangeMask': rangeMask,
        };
    }
}
exports.BitField32Template = BitField32Template;
class BitField32 {
    constructor(_fields, int32Value) {
        this._fields = _fields;
        this.int32Value = int32Value;
        this.int32Value &= 0xFFFFFFFF;
    }
    setBits(name, value) {
        const f = this._fields[name];
        this.int32Value = (this.int32Value & ~f.fieldMask) | ((value & f.rangeMask) << f.lb);
        return this;
    }
    getBits(name) {
        const f = this._fields[name];
        return (this.int32Value & f.fieldMask) >> f.lb;
    }
    reverse(name) {
        const f = this._fields[name];
        this.int32Value = this.int32Value ^ f.fieldMask;
        return this;
    }
}
//# sourceMappingURL=Number.js.map