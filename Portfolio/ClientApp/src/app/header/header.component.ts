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

  toggleDarkMode() {
    if (!("theme" in localStorage)) {
      localStorage.theme = "light";
    }

    localStorage.theme = localStorage.theme === "light" ? "dark" : "light";
    if (localStorage.theme === "dark") {
      document.querySelector("html").classList.add("dark");
    }
    else {
      document.querySelector("html").classList.remove("dark");
    }

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
