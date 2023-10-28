"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStringToEnumConvertor = exports.createEnumToStringConvertor = exports.createEnumInputValidationRule = void 0;
const E = __importStar(require("./Errors/Defs"));
function extractEnumStringNameList(theEnum) {
    return Object.keys(theEnum ?? {})
        .filter((i) => !/^\d+(\.\d+)?|(\d*\.)\d+$/.test(i));
}
function generateEnumToHumanfulNameMapping(theEnum) {
    const ret = {};
    for (const k of extractEnumStringNameList(theEnum)) {
        ret[theEnum[k]] = k.toLowerCase();
    }
    return ret;
}
function generateHumanfulNameToEnumMapping(theEnum) {
    const ret = {};
    for (const k of extractEnumStringNameList(theEnum)) {
        ret[k.toLowerCase()] = theEnum[k];
    }
    return ret;
}
function assertEnum(theEnum) {
    if (typeof theEnum !== 'object' || theEnum === null) {
        throw new E.E_INVALID_ENUM({ enum: theEnum });
    }
}
function extractEnumHumanfulNameList(theEnum) {
    assertEnum(theEnum);
    return extractEnumStringNameList(theEnum).map((v) => v.toLowerCase());
}
function createEnumInputValidationRule(theEnum) {
    assertEnum(theEnum);
    return extractEnumHumanfulNameList(theEnum).map((v) => `==${v}`);
}
exports.createEnumInputValidationRule = createEnumInputValidationRule;
function createEnumToStringConvertor(theEnum) {
    assertEnum(theEnum);
    return (new Function('enumObj', `const maps = ${JSON.stringify(generateEnumToHumanfulNameMapping(theEnum))}; return (s) => maps[s];`))(theEnum);
}
exports.createEnumToStringConvertor = createEnumToStringConvertor;
function createStringToEnumConvertor(theEnum) {
    assertEnum(theEnum);
    return (new Function('enumObj', `const maps = ${JSON.stringify(generateHumanfulNameToEnumMapping(theEnum))}; return function(s) {

        if (typeof s !== 'string') {

            return undefined;
        }

        return maps[s];

    }`))(theEnum);
}
exports.createStringToEnumConvertor = createStringToEnumConvertor;
//# sourceMappingURL=Enum.js.map