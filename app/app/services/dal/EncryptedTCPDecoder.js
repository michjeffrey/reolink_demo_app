"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptTCPDecoder = void 0;
const CoreDecoder_1 = require("../core/CoreDecoder");
const TransportProtocol_1 = require("../core/TransportProtocol");
const HelloMessage_1 = require("../core/HelloMessage");
var EDecodeState;
(function (EDecodeState) {
    EDecodeState[EDecodeState["READ_HELLO_PACKET"] = 0] = "READ_HELLO_PACKET";
    EDecodeState[EDecodeState["READ_OTHER_PACKET"] = 1] = "READ_OTHER_PACKET";
})(EDecodeState || (EDecodeState = {}));
class EncryptTCPDecoder {
    constructor() {
        this._state = EDecodeState.READ_HELLO_PACKET;
        this._headerBuffer = Buffer.allocUnsafe(0);
        this._decoder = new CoreDecoder_1.CoreDecoder(TransportProtocol_1.ENCRYPT_TCP_HEADER_LENGTH, TransportProtocol_1.ENCRYPT_TCP_DATA_LENGTH_POS, TransportProtocol_1.ENCRYPT_TCP_DATA_LEN_SIZE);
    }
    push(buf) {
        const retBuffer = [];
        do {
            if (this._state === EDecodeState.READ_HELLO_PACKET) {
                if (this._headerBuffer.length >= HelloMessage_1.HELLO_MESSAGE_LENGTH) {
                    retBuffer.push({
                        'header': this._headerBuffer.subarray(0, HelloMessage_1.HELLO_MESSAGE_LENGTH),
                        'payload': []
                    });
                    this._headerBuffer = this._headerBuffer.subarray(HelloMessage_1.HELLO_MESSAGE_LENGTH);
                    this._state = EDecodeState.READ_OTHER_PACKET;
                    if (this._headerBuffer.length > 0) {
                        retBuffer.push(...this._decoder.push(this._headerBuffer));
                    }
                    break;
                }
                this._headerBuffer = Buffer.concat([this._headerBuffer, buf]);
                if (this._headerBuffer.length < HelloMessage_1.HELLO_MESSAGE_LENGTH) {
                    break;
                }
            }
            else {
                retBuffer.push(...this._decoder.push(buf));
                break;
            }
        } while (true);
        return retBuffer;
    }
}
exports.EncryptTCPDecoder = EncryptTCPDecoder;
//# sourceMappingURL=EncryptedTCPDecoder.js.map