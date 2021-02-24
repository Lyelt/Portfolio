import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/user';
import { Course } from '../models/course';
import { ArchivedStarTime, StarTime } from '../models/star-time';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeedrunService {

  private archivedStarTimesSubject: BehaviorSubject<ArchivedStarTime[]> = new BehaviorSubject(null);
  private starTimesSubject: BehaviorSubject<StarTime[]> = new BehaviorSubject(null);

  constructor(private http: HttpClient) {
    this.reload();
  }

  private reload() {
    this.getStarTimes();
    this.getArchivedStarTimes();
  }

  private getStarTimes() {
    return this.http.get<StarTime[]>('Speedrun/GetStarTimes').subscribe(data => {
      this.starTimesSubject.next(data);
    });
  }

  private getArchivedStarTimes() {
    return this.http.get<ArchivedStarTime[]>('Speedrun/GetArchivedStarTimes').subscribe(data => {
      this.archivedStarTimesSubject.next(data);
    });
  }

  getCourses() {
    return this.http.get<Course[]>('Speedrun/GetCourses');
  }

  getSpeedrunners() {
    return this.http.get<User[]>("Speedrun/GetUsers");
  }

  updateStarTime(starTime: StarTime) {
    return this.http.post("Speedrun/UpdateStarTime", starTime).subscribe(result => {
      this.getStarTimes();
      this.getArchivedStarTimes();
    });
  }

  public archivedStarTimes(): Observable<ArchivedStarTime[]> {
    return this.archivedStarTimesSubject.asObservable();
  }

  public starTimes(): Observable<StarTime[]> {
    return this.starTimesSubject.asObservable();
  }
}
