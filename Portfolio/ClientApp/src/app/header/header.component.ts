import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  mobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (!('userName' in localStorage)) {
      this.authService.logout();
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigateByUrl('/');
  }

  loggedInUserName() {
    if ('jwt' in localStorage && 'userName' in localStorage) {
      return localStorage.getItem("userName")
    }
  }
}
