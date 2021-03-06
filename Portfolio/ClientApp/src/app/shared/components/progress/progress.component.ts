import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {
  @Input() percentage: number;
  @Input() complete: number;
  @Input() total: number;

  constructor() { }

  ngOnInit(): void {
  }

}
