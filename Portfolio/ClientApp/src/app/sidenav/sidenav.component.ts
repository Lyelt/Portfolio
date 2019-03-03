import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  constructor(private router: Router, private sidenavService: SidenavService) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      this.closeSidenav();
    });
  }

  closeSidenav() {
    this.sidenavService.sideNav.close();
  }
}
