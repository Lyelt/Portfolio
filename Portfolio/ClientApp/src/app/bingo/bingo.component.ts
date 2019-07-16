import { Component, OnInit } from '@angular/core';
import { SpeedrunService } from '../speedrun.service';

@Component({
  selector: 'app-bingo',
  templateUrl: './bingo.component.html',
  styleUrls: ['./bingo.component.scss']
})
export class BingoComponent implements OnInit {
  courses: BingoCourse[] = [];
  secrets: SecretStar[] = [];
  cannonsOpened: number = 0;
  secretsCompleted: number = 0;
  hundredsCompleted: number = 0;

  constructor() { }

  ngOnInit() {
    this.retrieveData();
  }

  retrieveData() {
    this.courses = [
      { name: "BoB", hasCannon: true },
      { name: "WF", hasCannon: true },
      { name: "JRB", hasCannon: true },
      { name: "CCM", hasCannon: true },
      { name: "BBH", hasCannon: false },
      { name: "HMC", hasCannon: false },
      { name: "LLL", hasCannon: false },
      { name: "SSL", hasCannon: true },
      { name: "DDD", hasCannon: false },
      { name: "SL", hasCannon: true },
      { name: "WDW", hasCannon: true },
      { name: "TTM", hasCannon: true },
      { name: "THI", hasCannon: true },
      { name: "TTC", hasCannon: false },
      { name: "RR", hasCannon: true }
    ];

    this.secrets = [
      { name: "Slide 1" },
      { name: "Slide 2" },
      { name: "Aquarium Reds" },
      { name: "BitDW Reds" },
      { name: "Wing Cap Reds" },
      { name: "Toad 1 (12 stars)" },
      { name: "Toad 2 (25 stars)" },
      { name: "Toad 3 (35 stars)" },
      { name: "Mips 1 (15 stars)" },
      { name: "Mips 2 (50 stars)" },
      { name: "BitFS Reds" },
      { name: "BitS Reds" },
      { name: "Invis Cap Reds" },
      { name: "Metal Cap Reds" },
      { name: "Cloud Stage Reds" },
    ];
  }

  reset() {
    this.cannonsOpened = 0;
    this.secretsCompleted = 0;
    this.hundredsCompleted = 0;
  }
}

export class BingoCourse {
  name: string;
  hasCannon: boolean;
}

export class SecretStar {
  name: string;
}
