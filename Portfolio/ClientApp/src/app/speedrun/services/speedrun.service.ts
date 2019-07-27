import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/user';
import { Course } from '../models/course';
import { StarTime } from '../models/star-time';

@Injectable({
  providedIn: 'root'
})
export class SpeedrunService {

  constructor(private http: HttpClient) {
  }

  getStarTimes() {
    return this.http.get<StarTime[]>('Speedrun/GetStarTimes');
  }

  getCourses() {
    return this.http.get<Course[]>('Speedrun/GetCourses');
  }

  getSpeedrunners() {
    return this.http.get<User[]>("Speedrun/GetUsers");
  }

  updateStarTime(starTime: StarTime) {
    return this.http.post("Speedrun/UpdateStarTime", starTime);
  }
}
