import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BowlingGame } from '../../models/bowling-game';
import { BowlingFrame } from '../../models/bowling-frame';
import { BowlingUtilities } from '../../models/bowling-utilities';

export class BowlingScore {
  display: string;
  value: number;
  show: boolean;
}

@Component({
  selector: 'app-bowling-game',
  templateUrl: './bowling-game.component.html',
  styleUrls: ['./bowling-game.component.scss']
})
export class BowlingGameComponent implements OnInit {
  @Input() game: BowlingGame;
  @Output() gameSaved: EventEmitter<BowlingGame> = new EventEmitter();
  @Output() gameDeleted: EventEmitter<BowlingGame> = new EventEmitter();

  currentFrame = 1; 
  currentRoll = 1;
  isSplit = false;

  possibleScores: BowlingScore[] = [
    { display: "-", value: 0, show: true },
    { display: "1", value: 1, show: true  },
    { display: "2", value: 2, show: true  },
    { display: "3", value: 3, show: true  },
    { display: "4", value: 4, show: true  },
    { display: "5", value: 5, show: true  },
    { display: "6", value: 6, show: true  },
    { display: "7", value: 7, show: true  },
    { display: "8", value: 8, show: true  },
    { display: "9", value: 9, show: true  },
    { display: "X", value: 10, show: true  }
  ];
  constructor() { }

  ngOnInit() {
  }

  getScoresToDisplay() {
    return this.possibleScores.filter(s => s.show);
  }

  selectFrame(frameNumber: number) {
    if (frameNumber > 0) {
      this.currentFrame = frameNumber;
      this.currentRoll = 1;
    }

    this.possibleScores.forEach(s => s.show = true);
    if (this.possibleScores.find(s => s.display === "/")) {
      this.possibleScores.pop();
    }
  }

  addScore(score: number) {
    const frame = BowlingUtilities.getFrame(this.game, this.currentFrame);
    frame.isSplit = this.isSplit;

    this.possibleScores.forEach(s => s.show = (score === 10 || s.value < (10 - score)) || (this.currentRoll === 2));
    if (score !== 10 && (this.currentRoll === 1 || this.currentFrame === 10) && !this.possibleScores.find(s => s.display === "/")) {
      this.possibleScores.push({ display: "/", value: (10 - score), show: true });
    }
    else if (this.possibleScores.find(s => s.display === "/")) {
      this.possibleScores.pop();
    }

    if (this.currentRoll === 1) {
      frame.roll1Score = score;

      if (score !== 10 || this.currentFrame === 10) {
        this.currentRoll++;
      }
      else if (this.currentFrame !== 10) {
        this.currentFrame++;
      }
    }
    else if (this.currentRoll === 2) {
      frame.roll2Score = score;

      if (this.currentFrame !== 10) {
        this.currentFrame++;
        this.currentRoll = 1;
      }
      else if (score === 10 || frame.roll1Score + score === 10 || frame.roll1Score === 10) {
        this.currentRoll++;
      }
    }
    else {
      frame.roll3Score = score;
    }

    const scoreSoFar = this.getScoreSoFar(this.game, frame);
    this.game.totalScore = scoreSoFar === "" ? 0 : scoreSoFar as number;
  }

  back() {
    const frame = BowlingUtilities.getFrame(this.game, this.currentFrame);
    frame.roll1Score = null;
    frame.roll2Score = null;
    frame.roll3Score = null;

    this.selectFrame(this.currentFrame - 1);
  }

  handleKey(event: KeyboardEvent) {
    if (this.game.id !== 0)
      return; // Only handle score input for new games.

    let value: number;
    // Digits 0-9
    if (event.keyCode >= 48 && event.keyCode <= 57) {
      value = event.keyCode - 48;
    }
    // X
    else if (event.keyCode === 88) {
      value = 10;
    }
    // Slash (/)
    else if (event.keyCode === 191) {
      value = this.possibleScores.find(s => s.display === "/").value;
    }
    // Hyphen (-)
    else if (event.keyCode === 189) {
      value = 0;
    }
    // Left arrow key
    else if (event.keyCode === 37) {
      this.back();
    }
    // Right arrow key
    else if (event.keyCode === 39) {
      this.selectFrame(this.currentFrame + 1);
    }

    if (value !== null && this.possibleScores.filter(s => s.value === value).some(s => s.show)) {
      this.isSplit = event.shiftKey;
      this.addScore(value);
    }
  }

  save() {
    this.gameSaved.emit(this.game);
  }

  delete() {
    this.gameDeleted.emit(this.game);
  }

  getScoreSoFar(game: BowlingGame, frame: BowlingFrame) {
    const score = BowlingUtilities.getScoreSoFar(game, frame);
    return score ? score : "";
  }

  getRoll1Display(frame: BowlingFrame) {
    return frame.roll1Score === 10 ? "X" :
        frame.roll1Score === 0 ? "-" :
        frame.roll1Score;
  }

  getRoll2Display(frame: BowlingFrame) {
    // If this is the 10th frame and we have just stricken, we may have X X
    if (frame.frameNumber === 10 && frame.roll2Score === 10 && frame.roll1Score === 10)
      return "X";

    // If the first roll was a strike and this is not the 10th, we can safely assume there was no second roll.
    if (frame.frameNumber !== 10 && frame.roll1Score === 10)
      return null;

    // Otherwise, we're either a / or just the score itself.
    return frame.roll2Score + frame.roll1Score === 10 ? "/" :
      frame.roll2Score === 0 ? "-" :
      frame.roll2Score;
  }

  getRoll3Display(frame: BowlingFrame) {
    return frame.roll3Score === 10 ? "X" :
      (frame.roll3Score + frame.roll2Score === 10 && this.getRoll2Display(frame) !== "/") ? "/" :
      frame.roll3Score === 0 ? "-" :
      frame.roll3Score;
  }
}
