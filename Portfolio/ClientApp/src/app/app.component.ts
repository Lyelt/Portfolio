import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  toolbar: boolean = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
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

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
      )
      .pipe(
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data),
      )
      .subscribe(event => {
        if (event != null && event.toolbar != null)
          this.toolbar = event.toolbar;
      });
  }
}
