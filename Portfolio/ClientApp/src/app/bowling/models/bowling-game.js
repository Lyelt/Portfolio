"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BowlingGame = /** @class */ (function () {
    function BowlingGame() {
    }
    BowlingGame.clone = function (other) {
        var game = new BowlingGame();
        game.id = other.id;
        game.userId = other.userId;
        game.bowlingSessionId = other.bowlingSessionId;
        game.totalScore = other.totalScore;
        game.gameNumber = other.gameNumber;
        game.frames = other.frames;
        return game;
    };
    BowlingGame.prototype.getFrame = function (frameNumber) {
        return this.frames.filter(function (f) { return f.frameNumber == frameNumber; })[0];
    };
    return BowlingGame;
}());
exports.BowlingGame = BowlingGame;
//# sourceMappingURL=bowling-game.js.map