import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private authService: AuthService, ) { }

  ngOnInit() {
    if (!('userName' in localStorage)) {
      this.authService.logout();
    }
  }

  scrollToElement(elementId: string) {
    // Update the URL hash without triggering Angular scroll restoration
    history.replaceState(null, '', `#${elementId}`);
    const el = document.querySelector("#" + elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  loggedInUserName() {
    if ('jwt' in localStorage && 'userName' in localStorage) {
      return localStorage.getItem("userName")
    }
  }
}
