import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game-night',
  templateUrl: './game-night.component.html',
  styleUrls: ['./game-night.component.scss']
})
export class GameNightComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router){

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const route = this.route.routeConfig.path.split('/')[1];

      if (route === 'home') {
          const id = +params['cardId'];
          
      }
    });
  }

  public isActive(route: string): boolean {
    return this.route.routeConfig.path.split('/')[1] === route;
  }
}
