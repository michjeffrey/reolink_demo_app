"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugJsonify = void 0;
const Fns_1 = require("./Fns");
const BUILT_IN_CLASSES = [Promise, WeakMap, WeakSet, Proxy];
function doJsonify(obj, finished) {
    if (obj === null) {
        return null;
    }
    switch (typeof obj) {
        case 'undefined':
            return '#value(undefined)';
        case 'function':
            return `#function:${JSON.stringify(obj.toString()).slice(1)}`;
        case 'number':
        case 'boolean':
        case 'string':
            return obj;
        case 'symbol':
            return `#symbol(${obj.description})`;
        case 'bigint':
            return `#bigint(${obj.toString()})`;
        case 'object': {
            if (finished.includes(obj)) {
                return '#object(cycle-reference)';
            }
            finished = [obj, ...finished];
            const ctor = (0, Fns_1.getClassOfObject)(obj);
            if (ctor !== Object) {
                if (BUILT_IN_CLASSES.includes(ctor)) {
                    return `#${ctor.name}`;
                }
                if (obj instanceof Buffer) {
                    if (obj.byteLength > 0x400) {
                        return `#buffer(${obj.byteLength}):${obj.subarray(0, 6).toString('base64')}...${obj.subarray(-6).toString('base64')}`;
                    }
                    else {
                        return `#buffer(${obj.byteLength}):${obj.toString('base64')}`;
                    }
                }
                if (obj instanceof Map) {
                    const ret = {};
                    for (const [k, v] of obj.entries()) {
                        ret[doJsonify(k, finished)] = doJsonify(v, finished);
                    }
                    return ret;
                }
                if (obj instanceof Set) {
                    const ret = new Array(obj.size);
                    let i = 0;
                    for (const o of obj.values()) {
                        ret[i++] = doJsonify(o, finished);
                    }
                    return ret;
                }
                if (Array.isArray(obj)) {
                    const ret = new Array(obj.length);
                    for (let i = 0; i < obj.length; i++) {
                        ret[i] = doJsonify(obj[i], finished);
                    }
                    return ret;
                }
            }
            const entries = (0, Fns_1.getObjectEntries)(obj);
            const ret = {};
            for (const k of entries) {
                const v = obj[k];
                ret[doJsonify(k, [])] = doJsonify(v, finished);
            }
            return ret;
        }
        default:
            return null;
    }
}
function debugJsonify(value) {
    return doJsonify(value, []);
}
exports.debugJsonify = debugJsonify;
//# sourceMappingURL=debugJsonify.js.map