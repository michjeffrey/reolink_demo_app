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
exports.question = void 0;
const $Readline = __importStar(require("readline"));
function question(prompt, defaultValue = '', mode = 'raw') {
    return new Promise((resolve) => {
        const rl = $Readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(prompt, (answer) => {
            rl.close();
            if (mode === 'hidden') {
                rl.output.write('\n');
            }
            resolve(answer || defaultValue);
        });
        (function (reader) {
            reader._writeToOutput = function (stringToWrite) {
                switch (mode) {
                    case 'raw':
                        reader.output.write(stringToWrite);
                        break;
                    case 'masked':
                        reader.output.write('*');
                        break;
                    case 'hidden':
                        break;
                }
            };
        })(rl);
    });
}
exports.question = question;
//# sourceMappingURL=CLI.js.map