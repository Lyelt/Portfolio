import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dog-indicator',
  templateUrl: './dog-indicator.component.html',
  styleUrls: ['./dog-indicator.component.scss']
})
export class DogIndicatorComponent implements OnInit {

  @Input() isOutside: boolean;
  @Input() dogName: string;
  @Input() borderClass: string;
  @Input() bgClass: string;
  @Input() textClass: string;
  @Input() animatedBorderClass: string;
  
  constructor() { }

  ngOnInit(): void {
  }

}
