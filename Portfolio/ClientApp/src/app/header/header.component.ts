import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {

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
