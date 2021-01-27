import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit {
  theme: string;
  constructor() { }

  ngOnInit(): void {
    if (!('theme' in localStorage)) {
      localStorage.theme = window.matchMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    }

    this.theme = localStorage.theme;
  }

  toggleDarkMode() {
    localStorage.theme = localStorage.theme === 'light' ? 'dark' : 'light';
    this.theme = localStorage.theme;

    document.querySelector('html').classList.remove('light', 'dark');
    document.querySelector('html').classList.add(localStorage.theme);
  }
}
