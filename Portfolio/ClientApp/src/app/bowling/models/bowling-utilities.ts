import { BowlingGame } from './bowling-game';
import { BowlingFrame } from './bowling-frame';
import { SeriesCategory, SeriesCategoryEnum } from './series-category';

export abstract class BowlingUtilities {
  public static seriesCategories: SeriesCategory[] = [
    { category: SeriesCategoryEnum.SessionAverage, display: "Session Average Score" },
    { category: SeriesCategoryEnum.OverallAverage, display: "Overall Average Score" },
    { category: SeriesCategoryEnum.Game, display: "Individual Game Score" },
    { category: SeriesCategoryEnum.StrikePct, display: "Overall Strike Percentage" },
    { category: SeriesCategoryEnum.SinglePinSparePct, display: "Overall Single Pin Spare Percentage" },
  ];

  public static newGame(sessionId: number, gameNumber: number, userId: string): BowlingGame {
    let game: BowlingGame = new BowlingGame();
    game.id = 0;
    game.gameNumber = gameNumber;
    game.bowlingSessionId = sessionId;
    game.userId = userId;
    game.frames = BowlingUtilities.getEmptyFrames(0);
    return game;
  }

  public static getEmptyFrames(gameId: number): BowlingFrame[] {
    return [
      BowlingFrame.create(gameId, 1),
      BowlingFrame.create(gameId, 2),
      BowlingFrame.create(gameId, 3),
      BowlingFrame.create(gameId, 4),
      BowlingFrame.create(gameId, 5),
      BowlingFrame.create(gameId, 6),
      BowlingFrame.create(gameId, 7),
      BowlingFrame.create(gameId, 8),
      BowlingFrame.create(gameId, 9),
      BowlingFrame.create(gameId, 10)
    ];
  }

  public static getScoreSoFar(game: BowlingGame, frame: BowlingFrame): number {
    let scoreSoFar: number = 0;

    for (let i = 1; i <= frame.frameNumber; i++) {
      let currFrame = BowlingUtilities.getFrame(game, i);
      let nextFrame = BowlingUtilities.getFrame(game, i + 1);
      let frameAfter = BowlingUtilities.getFrame(game, i + 2);

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
  }

  public static isStrike(frame: BowlingFrame): boolean {
    return frame.roll1Score == 10;
  }

  public static isSpare(frame: BowlingFrame): boolean {
    return frame.roll1Score + frame.roll2Score == 10;
  }

  public static getFrame(game: BowlingGame, frameNumber: number): BowlingFrame {
    return game.frames.filter(f => f.frameNumber == frameNumber)[0];
  }
}
