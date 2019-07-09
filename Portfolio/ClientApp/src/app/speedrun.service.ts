import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StarTime } from './speedrun/speedrun.component';

@Injectable({
  providedIn: 'root'
})
export class SpeedrunService {

  constructor(private http: HttpClient) {
  }

  getStarTimes() {
    return this.http.get<StarTime[]>('Speedrun/GetStarTimes');
  }
}
