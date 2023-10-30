"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFloatString = exports.isIntegerString = exports.isInfinite = exports.isNaN = exports.isRealNumber = exports.isSafeNonNegativeInteger = exports.isSafeInteger = exports.isNonNegativeInteger = exports.isInteger = exports.isNonNegative = exports.isNegative = exports.isArrayNonEmpty = exports.isArrayEmpty = exports.isArrayOfRawObject = exports.isArrayOfArray = exports.isArrayOfNumber = exports.isArrayOfString = exports.createArrayTypeChecker = exports.isArrayOf = exports.isDictOfRawObject = exports.isDictOfArray = exports.isDictOfNumber = exports.isDictOfString = exports.createDictTypeChecker = exports.isDictOf = exports.isObjectNonEmpty = exports.isObjectEmpty = exports.isStringNonBlank = exports.isStringBlank = exports.isStringNonEmpty = exports.isStringEmpty = exports.isConstructor = exports.isFunction = exports.isRawObject = exports.isArray = exports.isSymbol = exports.isBigInt = exports.isBoolean = exports.isNumber = exports.isString = exports.isOmitted = exports.isUndefined = exports.isNull = exports.createValidator = exports.validate = void 0;
exports.validate = function (value, ...vs) {
    if (Array.isArray(vs[0])) {
        for (const fn of vs[0]) {
            if (!fn(value)) {
                return false;
            }
        }
        vs = vs.slice(1);
    }
    for (const fn of vs) {
        if (!fn(value)) {
            return false;
        }
    }
    return true;
};
exports.createValidator = function (...args) {
    return (v) => (0, exports.validate)(v, ...args);
};
const isNull = (v) => v === null;
exports.isNull = isNull;
const isUndefined = (v) => v === undefined;
exports.isUndefined = isUndefined;
const isOmitted = (v) => v === undefined || v === null;
exports.isOmitted = isOmitted;
const isString = (v) => typeof v === 'string';
exports.isString = isString;
const isNumber = (v) => typeof v === 'number';
exports.isNumber = isNumber;
const isBoolean = (v) => v === true || v === false;
exports.isBoolean = isBoolean;
const isBigInt = (v) => typeof v === 'bigint';
exports.isBigInt = isBigInt;
const isSymbol = (v) => typeof v === 'symbol';
exports.isSymbol = isSymbol;
exports.isArray = Array.isArray;
const isRawObject = function (v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
};
exports.isRawObject = isRawObject;
const isFunction = function (v) {
    return typeof v === 'function' && !Function.prototype.toString.call(v).startsWith('class');
};
exports.isFunction = isFunction;
const isConstructor = function (v) {
    return typeof v === 'function' && Function.prototype.toString.call(v).startsWith('class');
};
exports.isConstructor = isConstructor;
const isStringEmpty = (v) => v.length === 0;
exports.isStringEmpty = isStringEmpty;
const isStringNonEmpty = (v) => v.length > 0;
exports.isStringNonEmpty = isStringNonEmpty;
const isStringBlank = (v) => v.trim().length === 0;
exports.isStringBlank = isStringBlank;
const isStringNonBlank = (v) => v.trim().length > 0;
exports.isStringNonBlank = isStringNonBlank;
const isObjectEmpty = (v) => Object.keys(v).length === 0;
exports.isObjectEmpty = isObjectEmpty;
const isObjectNonEmpty = (v) => Object.keys(v).length > 0;
exports.isObjectNonEmpty = isObjectNonEmpty;
function isDictOf(dict, typeChecker) {
    for (const i of Object.values(dict)) {
        if (!typeChecker(i)) {
            return false;
        }
    }
    return true;
}
exports.isDictOf = isDictOf;
function createDictTypeChecker(typeChecker) {
    return (dict) => isDictOf(dict, typeChecker);
}
exports.createDictTypeChecker = createDictTypeChecker;
exports.isDictOfString = createDictTypeChecker(exports.isString);
exports.isDictOfNumber = createDictTypeChecker(exports.isNumber);
exports.isDictOfArray = createDictTypeChecker(exports.isArray);
exports.isDictOfRawObject = createDictTypeChecker(exports.isRawObject);
function isArrayOf(arr, typeChecker) {
    for (const i of arr) {
        if (!typeChecker(i)) {
            return false;
        }
    }
    return true;
}
exports.isArrayOf = isArrayOf;
function createArrayTypeChecker(typeChecker) {
    return (arr) => isArrayOf(arr, typeChecker);
}
exports.createArrayTypeChecker = createArrayTypeChecker;
exports.isArrayOfString = createArrayTypeChecker(exports.isString);
exports.isArrayOfNumber = createArrayTypeChecker(exports.isNumber);
exports.isArrayOfArray = createArrayTypeChecker(exports.isArray);
exports.isArrayOfRawObject = createArrayTypeChecker(exports.isArray);
const isArrayEmpty = (v) => v.length === 0;
exports.isArrayEmpty = isArrayEmpty;
const isArrayNonEmpty = (v) => v.length > 0;
exports.isArrayNonEmpty = isArrayNonEmpty;
const isNegative = (v) => v < 0;
exports.isNegative = isNegative;
const isNonNegative = (v) => v >= 0;
exports.isNonNegative = isNonNegative;
exports.isInteger = Number.isInteger;
const isNonNegativeInteger = (v) => (0, exports.isInteger)(v) && v >= 0;
exports.isNonNegativeInteger = isNonNegativeInteger;
exports.isSafeInteger = Number.isSafeInteger;
const isSafeNonNegativeInteger = (v) => (0, exports.isSafeInteger)(v) && v >= 0;
exports.isSafeNonNegativeInteger = isSafeNonNegativeInteger;
const isRealNumber = (v) => Number.isFinite(v) && !Number.isNaN(v);
exports.isRealNumber = isRealNumber;
exports.isNaN = Number.isNaN;
const isInfinite = function (v) {
    return v === Number.POSITIVE_INFINITY || v === Number.NEGATIVE_INFINITY;
};
exports.isInfinite = isInfinite;
const REGEXP_IS_INTEGER = /^(-|\+)?([1-9]\d*|0)$/;
const REGEXP_IS_INTEGER_WITH_LEADING_ZERO = /^(-|\+)?\d+$/;
function isIntegerString(input, allowLeading0 = false) {
    return (allowLeading0 ? REGEXP_IS_INTEGER_WITH_LEADING_ZERO : REGEXP_IS_INTEGER).test(input);
}
exports.isIntegerString = isIntegerString;
const floatStringRegExpCache = {};
const REGEXP_IS_REAL_NUMBER = /^(-|\+)?([1-9]\d*|0)(\.\d+)?$/;
const REGEXP_IS_REAL_NUMBER_WITH_LEADING_ZERO = /^(-|\+)?\d+(\.\d+)?$/;
function isFloatString(input, maxAcc = null, minAcc = null, allowLeading0 = false) {
    if ((0, exports.isOmitted)(maxAcc)) {
        return (allowLeading0 ? REGEXP_IS_REAL_NUMBER_WITH_LEADING_ZERO : REGEXP_IS_REAL_NUMBER).test(input);
    }
    if (maxAcc <= 0) {
        return isIntegerString(input, allowLeading0);
    }
    minAcc ?? (minAcc = maxAcc ?? 0);
    if (!(0, exports.isSafeInteger)(minAcc) || minAcc < 0) {
        minAcc = 0;
    }
    if (maxAcc < minAcc) {
        minAcc = maxAcc;
    }
    const pFloat = minAcc === maxAcc ? `\\.\\d{${minAcc}}` :
        minAcc === 0 ? `(\\.\\d{1,${maxAcc}})?` : `\\.\\d{${minAcc},${maxAcc}}`;
    const pInt = allowLeading0 ? '\\d+' : '([1-9]\\d*|0)';
    const re = `^(-|\\+)?${pInt}${pFloat}$`;
    if (!floatStringRegExpCache[re]) {
        floatStringRegExpCache[re] = new RegExp(re);
    }
    return floatStringRegExpCache[re].test(input);
}
exports.isFloatString = isFloatString;
//# sourceMappingURL=Validation.js.map