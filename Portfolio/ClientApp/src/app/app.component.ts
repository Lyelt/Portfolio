import { Component, ViewChild } from '@angular/core';
import { MatSidenav, MatIconRegistry } from '@angular/material';
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
    }

    ngOnInit() {
    }

}
