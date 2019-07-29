"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BowlingSeries = /** @class */ (function () {
    function BowlingSeries(sessions, user) {
        this.name = user.userName;
        var filterUserGames = function (games) { return games.filter(function (g) { return g.userId == user.id; }); };
        this.series = sessions.filter(function (s) { return filterUserGames(s.games).length > 0; }).map(function (s) { return new SeriesEntry(filterUserGames(s.games), new Date(s.date)); });
    }
    return BowlingSeries;
}());
exports.BowlingSeries = BowlingSeries;
var SeriesEntry = /** @class */ (function () {
    function SeriesEntry(games, date) {
        this.name = date;
        var sum = 0;
        for (var _i = 0, games_1 = games; _i < games_1.length; _i++) {
            var game = games_1[_i];
            sum += game.totalScore;
        }
        this.value = sum / games.length;
    }
    return SeriesEntry;
}());
exports.SeriesEntry = SeriesEntry;
//# sourceMappingURL=bowling-series.js.map