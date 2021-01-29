import { Component, HostListener, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AlertService } from '../../alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit {
  @ViewChild("modal") modal;
  constructor(public alertService: AlertService, private el: ElementRef) { }

  ngOnInit(): void {
  }

  @HostListener('document:click', [`$event`])
  onClick(event) {
    if (this.modal && !this.modal.nativeElement.contains(event.target)) {
      this.closeModal();
    }
  }

  closeModal() {
    this.alertService.isVisible = false;
  }

  getGithubIssueUrl(): string {
    return `https://github.com/Lyelt/Portfolio/issues/new?title=Error%20encountered%20while%20navigating%20Portfolio%20website&body=${encodeURIComponent(this.alertService.alertMessage)}`;
  }
}
