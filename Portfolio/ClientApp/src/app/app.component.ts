import { Component, ViewChild } from '@angular/core';
import { SidenavService } from './sidenav.service';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('sidenav') public sideNav: MatSidenav;

  constructor(router: Router, private sidenavService: SidenavService) {
  }

  ngOnInit() {
    this.sidenavService.sideNav = this.sideNav;
  }

  toggleSidenav() {
    this.sidenavService.sideNav.toggle();
  }
}
