import { BowlingFrame } from './bowling-frame';

export class BowlingGame {
  id: number;

  userId: string;

  bowlingSessionId: number;

  totalScore: number;

  gameNumber: number;

  frames: BowlingFrame[];

  public static clone(other: BowlingGame): BowlingGame {
    let game = new BowlingGame();
    game.id = other.id;
    game.userId = other.userId;
    game.bowlingSessionId = other.bowlingSessionId;
    game.totalScore = other.totalScore;
    game.gameNumber = other.gameNumber;
    game.frames = other.frames;
    return game;
  }

  public getFrame(frameNumber: number): BowlingFrame {
    return this.frames.filter(f => f.frameNumber == frameNumber)[0];
  }
}
