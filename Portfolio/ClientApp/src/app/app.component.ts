import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(router: Router, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      "bowling",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/bowling.svg")
    );

    this.matIconRegistry.addSvgIcon(
      "yugioh",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/yugioh.svg")
    );
  }

  ngOnInit() {
    if (localStorage.theme === "dark") {
      document.querySelector("html").classList.add("dark");
    }
    else {
      document.querySelector("html").classList.remove("dark");
    }
  }
}
