import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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
}
