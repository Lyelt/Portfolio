import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent {
  @Input() percentage: number;
  @Input() complete: number;
  @Input() total: number;
  @Input() showNumbers: boolean = true;

  get normalizedPercentage(): number {
    const value = Number.isFinite(this.percentage) ? this.percentage : 0;
    return Math.min(100, Math.max(0, value));
  }

  get progressValueText(): string {
    if (this.complete !== null && this.complete !== undefined && this.total !== null && this.total !== undefined) {
      return `${this.complete} of ${this.total}`;
    }

    return `${Math.round(this.normalizedPercentage)} percent`;
  }

}
