import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-game-night',
  templateUrl: './game-night.component.html',
  styleUrls: ['./game-night.component.scss']
})
export class GameNightComponent {
  constructor(private route: ActivatedRoute) { }

  public isActive(route: string): boolean {
    return this.route.routeConfig.path.split('/')[1] === route;
  }
}
