import { BowlingFrame } from './bowling-frame';

export class BowlingGame {
  id: number;

  userId: string;

  sessionId: number;

  totalScore: number;

  gameNumber: number;

  frames: BowlingFrame[];
}
