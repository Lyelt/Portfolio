import { Component, OnInit, Input } from '@angular/core';
import { BowlingStat } from '../../models/bowling-stat';

@Component({
  selector: 'app-bowling-stat',
  templateUrl: './bowling-stat.component.html',
  styleUrls: ['./bowling-stat.component.scss']
})
export class BowlingStatComponent implements OnInit {

  @Input() stats: BowlingStat[];

  constructor() { }

  ngOnInit() {
  }

}
