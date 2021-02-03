import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss']
})
export class RadioButtonComponent implements OnInit {
  @Input() label: string;
  @Input() selected: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
