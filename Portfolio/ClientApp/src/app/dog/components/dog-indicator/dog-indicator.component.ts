import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-dog-indicator',
  templateUrl: './dog-indicator.component.html',
  styleUrls: ['./dog-indicator.component.scss']
})
export class DogIndicatorComponent {

  @Input() isOutside: boolean;
  @Input() dogName: string;
  @Input() borderClass: string;
  @Input() bgClass: string;
  @Input() textClass: string;
  @Input() animatedBorderClass: string;
}
