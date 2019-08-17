"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bowling_game_1 = require("./bowling-game");
var bowling_frame_1 = require("./bowling-frame");
var series_category_1 = require("./series-category");
var BowlingUtilities = /** @class */ (function () {
    function BowlingUtilities() {
    }
    BowlingUtilities.newGame = function (sessionId, gameNumber, userId) {
        var game = new bowling_game_1.BowlingGame();
        game.id = 0;
        game.gameNumber = gameNumber;
        game.bowlingSessionId = sessionId;
        game.userId = userId;
        game.frames = BowlingUtilities.getEmptyFrames(0);
        return game;
    };
    BowlingUtilities.getEmptyFrames = function (gameId) {
        return [
            bowling_frame_1.BowlingFrame.create(gameId, 1),
            bowling_frame_1.BowlingFrame.create(gameId, 2),
            bowling_frame_1.BowlingFrame.create(gameId, 3),
            bowling_frame_1.BowlingFrame.create(gameId, 4),
            bowling_frame_1.BowlingFrame.create(gameId, 5),
            bowling_frame_1.BowlingFrame.create(gameId, 6),
            bowling_frame_1.BowlingFrame.create(gameId, 7),
            bowling_frame_1.BowlingFrame.create(gameId, 8),
            bowling_frame_1.BowlingFrame.create(gameId, 9),
            bowling_frame_1.BowlingFrame.create(gameId, 10)
        ];
    };
    BowlingUtilities.getScoreSoFar = function (game, frame) {
        var scoreSoFar = 0;
        for (var i = 1; i <= frame.frameNumber; i++) {
            var currFrame = BowlingUtilities.getFrame(game, i);
            var nextFrame = BowlingUtilities.getFrame(game, i + 1);
            var frameAfter = BowlingUtilities.getFrame(game, i + 2);
            // Strike on anything but frame 10
            if (BowlingUtilities.isStrike(currFrame) && currFrame.frameNumber < 10) {
                if (nextFrame.roll1Score != null && BowlingUtilities.isStrike(nextFrame) && frameAfter && frameAfter.roll1Score != null)
                    scoreSoFar += 10 + nextFrame.roll1Score + frameAfter.roll1Score;
                else if (nextFrame.roll1Score != null && nextFrame.roll2Score != null)
                    scoreSoFar += 10 + nextFrame.roll1Score + nextFrame.roll2Score;
            }
            // Spare
            else if (BowlingUtilities.isSpare(currFrame) && currFrame.frameNumber < 10) {
                scoreSoFar += 10 + (nextFrame.roll1Score != null ? nextFrame.roll1Score : 0);
            }
            // Open or 10th frame
            else {
                scoreSoFar += currFrame.roll1Score + currFrame.roll2Score + (currFrame.roll3Score != null ? currFrame.roll3Score : 0);
            }
        }
        return scoreSoFar;
    };
    BowlingUtilities.isStrike = function (frame) {
        return frame.roll1Score == 10;
    };
    BowlingUtilities.isSpare = function (frame) {
        return frame.roll1Score + frame.roll2Score == 10;
    };
    BowlingUtilities.getFrame = function (game, frameNumber) {
        return game.frames.filter(function (f) { return f.frameNumber == frameNumber; })[0];
    };
    BowlingUtilities.seriesCategories = [
        { category: series_category_1.SeriesCategoryEnum.SessionAverage, display: "Session Average Score" },
        { category: series_category_1.SeriesCategoryEnum.OverallAverage, display: "Overall Average Score" },
        { category: series_category_1.SeriesCategoryEnum.Game, display: "Game Score" },
        { category: series_category_1.SeriesCategoryEnum.Game, display: "Overall Strike Percentage" },
        { category: series_category_1.SeriesCategoryEnum.Game, display: "Game Score" },
    ];
    return BowlingUtilities;
}());
exports.BowlingUtilities = BowlingUtilities;
//# sourceMappingURL=bowling-utilities.js.map