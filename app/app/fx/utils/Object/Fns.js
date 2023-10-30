"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = exports.getClassOfObject = exports.pick = exports.getObjectEntries = exports.copyFields = exports.existField = exports.isInheritedFrom = void 0;
const __1 = require("..");
function isInheritedFrom(subClass, parentClass) {
    return subClass?.__proto__ === parentClass || (subClass?.__proto__?.prototype !== undefined &&
        isInheritedFrom(subClass.__proto__, parentClass));
}
exports.isInheritedFrom = isInheritedFrom;
function existField(obj, fields) {
    return Object.keys(obj).filter((v) => fields.includes(v)).length > 0;
}
exports.existField = existField;
function copyFields(objDst, objSrc, fields) {
    for (const k of fields) {
        if (objSrc[k] !== undefined) {
            objDst[k] = objSrc[k];
        }
    }
}
exports.copyFields = copyFields;
function getObjectEntries(obj) {
    return [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj)
    ];
}
exports.getObjectEntries = getObjectEntries;
function pick(obj, keys) {
    const ret = {};
    for (const k of keys) {
        ret[k] = obj[k];
    }
    return ret;
}
exports.pick = pick;
function getClassOfObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        throw new TypeError('Expected an object.');
    }
    return obj.constructor;
}
exports.getClassOfObject = getClassOfObject;
function deepMergeArray(a1, a2, opts) {
    const l = Math.max(a1.length, a2.length);
    const ret = new Array(l);
    for (let i = 0; i < l; i++) {
        if (__1.Validation.isRawObject(a1[i]) && __1.Validation.isRawObject(a2[i])) {
            ret[i] = deepMerge(a1[i], a2[i], opts);
        }
        else if (__1.Validation.isArray(a1[i]) && __1.Validation.isArray(a2[i])) {
            ret[i] = deepMergeArray(a1[i], a2[i], opts);
        }
        else {
            ret[i] = a2[i] === undefined ? a1[i] : a2[i];
        }
    }
    return ret;
}
function deepMerge(obj1, obj2, opts = {}) {
    const ret = {};
    for (const k of getObjectEntries(obj1)) {
        ret[k] = obj1[k];
    }
    for (const k of getObjectEntries(obj2)) {
        if (__1.Validation.isRawObject(ret[k]) && __1.Validation.isRawObject(obj2[k])) {
            ret[k] = deepMerge(ret[k], obj2[k], opts);
        }
        else if (__1.Validation.isArray(ret[k]) && __1.Validation.isArray(obj2[k]) && !opts.arrayAsValue) {
            ret[k] = deepMergeArray(ret[k], obj2[k], opts);
        }
        else {
            ret[k] = obj2[k];
        }
    }
    return ret;
}
exports.deepMerge = deepMerge;
//# sourceMappingURL=Fns.js.map