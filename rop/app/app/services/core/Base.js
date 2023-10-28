"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uidTypeGuard = exports.MAX_TCP_CALLBACK_PACKET = exports.HTTP_OK_MESSAGE = exports.EVideoCodec = void 0;
var EVideoCodec;
(function (EVideoCodec) {
    EVideoCodec[EVideoCodec["H265"] = 1] = "H265";
    EVideoCodec[EVideoCodec["H264"] = 0] = "H264";
})(EVideoCodec = exports.EVideoCodec || (exports.EVideoCodec = {}));
exports.HTTP_OK_MESSAGE = {
    'message': 'ok'
};
exports.MAX_TCP_CALLBACK_PACKET = 65536;
exports.uidTypeGuard = '~=/^[A-Z0-9]{16}$/';
//# sourceMappingURL=Base.js.map