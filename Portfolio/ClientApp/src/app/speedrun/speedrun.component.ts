import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-speedrun',
  templateUrl: './speedrun.component.html',
  styleUrls: ['./speedrun.component.scss']
})
export class SpeedrunComponent implements OnInit {
  starTimes: StarTime[] = [];

  constructor(private http: Http) { }

  ngOnInit() {
    this.http.get('./test.json').subscribe(data => {
      for (let starTime of data.json()) {
        this.starTimes.push(starTime);
        console.log(starTime);
      }
    },
    (err) => console.error(err));
  }

}

export class StarTime {
  starId: number;

  level: string;

  starName: string;

  nickTime: string;

  mattTime: string;
}
