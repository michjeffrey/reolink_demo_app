"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitForInjection = exports.isBuiltInType = exports.ClassInjectionInfo = exports.Injection = exports.META_UNINIT = exports.META_INIT = exports.META_TYPE = exports.META_FACTORY = exports.META_SINGLETON = exports.META_INJECTION = void 0;
exports.META_INJECTION = Symbol('reolink:cloud:fx:di:injection');
exports.META_SINGLETON = Symbol('reolink:cloud:fx:di:singleton');
exports.META_FACTORY = Symbol('reolink:cloud:fx:di:factory');
exports.META_TYPE = Symbol('reolink:cloud:fx:di:type');
exports.META_INIT = Symbol('reolink:cloud:fx:di:initializer');
exports.META_UNINIT = Symbol('reolink:cloud:fx:di:uninitializer');
class Injection {
    constructor(token, opts) {
        this.token = token;
        this.opts = opts;
    }
}
exports.Injection = Injection;
class ClassInjectionInfo {
    constructor() {
        this.ctorInjections = [];
        this.propInjections = {};
    }
}
exports.ClassInjectionInfo = ClassInjectionInfo;
function isBuiltInType(t) {
    switch (t) {
        case Array:
        case Function:
        case Object:
        case String:
        case Number:
        case Boolean:
        case Symbol:
        case BigInt:
        case null:
        case undefined:
        case Promise:
            return true;
    }
    return false;
}
exports.isBuiltInType = isBuiltInType;
class WaitForInjection {
    constructor(token, opts = {}) {
        this.token = token;
        this.opts = opts;
    }
}
exports.WaitForInjection = WaitForInjection;
//# sourceMappingURL=Internal.js.map