import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    @Output() toggleSidenavEvent = new EventEmitter();
    constructor() { }

    ngOnInit() {
    
    }

    toggleSidenav() {
        this.toggleSidenavEvent.emit();
    }

    scrollToElement(elementId: string) {
      const el = document.querySelector("#" + elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    isLoggedIn() {
        return localStorage.getItem("jwt");
    }
}
