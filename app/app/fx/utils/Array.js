"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersectWith = exports.diffFrom = exports.includes = exports.flatten = exports.equals = exports.uniquify = exports.toGroupArrayDict = exports.toDict = exports.ensureArray = void 0;
function ensureArray(v) {
    return Array.isArray(v) ? v : [v];
}
exports.ensureArray = ensureArray;
function toDict(input, key) {
    const result = {};
    if (typeof key === 'function') {
        for (const item of input) {
            result[key(item)] = item;
        }
    }
    else {
        for (const item of input) {
            result[item[key]] = item;
        }
    }
    return result;
}
exports.toDict = toDict;
function toGroupArrayDict(input, key) {
    const result = {};
    if (typeof key === 'function') {
        for (const item of input) {
            const groupKey = key(item);
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
        }
    }
    else {
        for (const item of input) {
            const groupKey = item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
        }
    }
    return result;
}
exports.toGroupArrayDict = toGroupArrayDict;
exports.uniquify = function (items, makeKey) {
    if (makeKey) {
        const m = new Map();
        for (const i of items) {
            const k = makeKey(i);
            if (!m.has(k)) {
                m.set(k, i);
            }
        }
        return Array.from(m.values());
    }
    return Array.from(new Set(items));
};
exports.equals = function (a, b, comparer) {
    if (a.length !== b.length) {
        return false;
    }
    if (comparer) {
        for (let i = 0; i < a.length; i++) {
            if (comparer(a[i], b[i]) !== 0) {
                return false;
            }
        }
    }
    else {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
    }
    return true;
};
function flatten(arrayList) {
    return arrayList.reduce((p, q) => [...p, ...q], []);
}
exports.flatten = flatten;
function includes(arr, v, comparer) {
    for (const t of arr) {
        if (comparer(v, t) === 0) {
            return true;
        }
    }
    return false;
}
exports.includes = includes;
exports.diffFrom = function (a, b, comparer) {
    return comparer ? a.filter(v => !includes(b, v, comparer)) : a.filter(v => !b.includes(v));
};
exports.intersectWith = function (a, b, comparer) {
    return comparer ? a.filter(v => includes(b, v, comparer)) : a.filter(v => b.includes(v));
};
//# sourceMappingURL=Array.js.map