import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BingoService } from '../../services/bingo.service';

@Component({
  selector: 'app-bingo-goal',
  templateUrl: './bingo-goal.component.html',
  styleUrls: ['./bingo-goal.component.scss']
})
export class BingoGoalComponent implements OnInit {

  @Input() uncheckedIcon: string = "star_border";
  @Input() checkedIcon: string = "star";
  @Output() toggled: EventEmitter<boolean> = new EventEmitter<boolean>();

  checked: boolean = false;

  constructor(private bingoService: BingoService) { }

  ngOnInit() {
    this.bingoService.resetObservable.subscribe(_ => {
      this.checked = false;
    });
  }

  toggle() {
    this.checked = !this.checked;
    this.toggled.emit(this.checked);
  }

}
