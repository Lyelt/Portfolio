export class BowlingFrame {
  id: number;

  gameId: number;

  frameNumber: number;

  roll1Score: number;

  roll2Score: number;

  roll3Score: number;

  isSplit: boolean;

  public static create(gameId: number, frameNumber: number): BowlingFrame {
    let frame = new BowlingFrame();
    frame.gameId = gameId;
    frame.frameNumber = frameNumber;
    return frame;
  }
}
