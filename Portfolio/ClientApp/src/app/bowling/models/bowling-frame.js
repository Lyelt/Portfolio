"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BowlingFrame = /** @class */ (function () {
    function BowlingFrame() {
    }
    BowlingFrame.create = function (gameId, frameNumber) {
        var frame = new BowlingFrame();
        frame.gameId = gameId;
        frame.frameNumber = frameNumber;
        return frame;
    };
    return BowlingFrame;
}());
exports.BowlingFrame = BowlingFrame;
//# sourceMappingURL=bowling-frame.js.map