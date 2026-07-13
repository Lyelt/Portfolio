import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit {
  theme: 'light' | 'dark' = 'light';
  constructor() { }

  ngOnInit(): void {
    this.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  toggleDarkMode() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.setClass();
  }

  setClass() {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(this.theme);
  }
}
