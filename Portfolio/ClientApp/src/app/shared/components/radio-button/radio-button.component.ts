import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss']
})
export class RadioButtonComponent {
  @Input() label: string;
  @Input() selected: boolean;
}
