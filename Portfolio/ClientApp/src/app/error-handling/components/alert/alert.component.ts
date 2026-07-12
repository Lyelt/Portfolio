import { Component, HostListener } from '@angular/core';
import { AlertService } from '../../alert.service';

@Component({
  standalone: false,
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {
  constructor(public alertService: AlertService) { }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.alertService.isVisible) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
      return;
    }

  }

  closeModal() {
    this.alertService.hideError();
  }

  getGithubIssueUrl(): string {
    return `https://github.com/Lyelt/Portfolio/issues/new?title=Error%20encountered%20while%20navigating%20Portfolio%20website&body=${encodeURIComponent(this.alertService.alertMessage)}`;
  }
}
