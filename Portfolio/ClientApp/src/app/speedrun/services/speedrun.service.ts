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
  private allStarTimes: StarTime[] = [];

  private archivedStarTimesSubject: BehaviorSubject<ArchivedStarTime[]> = new BehaviorSubject(null);
  private starTimesSubject: BehaviorSubject<StarTime[]> = new BehaviorSubject(null);

  constructor(private http: HttpClient) {
    this.starTimes().subscribe(times => {
      this.allStarTimes = times;
    });
    
    this.reload();
  }

  private reload() {
    this.loadStarTimes();
    this.loadArchivedStarTimes();
  }

  private loadStarTimes() {
    return this.http.get<StarTime[]>('Speedrun/GetStarTimes').subscribe(data => {
      this.starTimesSubject.next(data);
    });
  }

  private loadArchivedStarTimes() {
    return this.http.get<ArchivedStarTime[]>('Speedrun/GetArchivedStarTimes').subscribe(data => {
      this.archivedStarTimesSubject.next(data);
    });
  }

  deleteArchive(archive: ArchivedStarTime) {
    return this.http.delete(`Speedrun/DeleteArchivedStarTime/${archive.id}`).subscribe(result => {
      this.reload();
    });
  }

  getCourses() {
    return this.http.get<Course[]>('Speedrun/GetCourses');
  }

  getSpeedrunners() {
    return this.http.get<User[]>("Speedrun/GetUsers");
  }

  updateStarTime(starTime: StarTime) {
    this.http.post("Speedrun/UpdateStarTime", starTime).subscribe(result => {
      this.reload();
    });
  }

  public archivedStarTimes(): Observable<ArchivedStarTime[]> {
    return this.archivedStarTimesSubject.asObservable();
  }

  public starTimes(): Observable<StarTime[]> {
    return this.starTimesSubject.asObservable();
  }

  public starTimeIsFastest(starTime: StarTime): boolean {
    const timesForThisStar = this.allStarTimes.filter(st => st.starId == starTime.starId);
    let isFastestTime = false;

    if (timesForThisStar.length > 0) {
      let minStarTime = timesForThisStar.reduce((prev, curr) => prev.totalMilliseconds < curr.totalMilliseconds ? prev : curr);
      isFastestTime = minStarTime.totalMilliseconds == starTime.totalMilliseconds;
    }

    return isFastestTime;
  } 

  public getStarTime(starId: number, userId: string): StarTime {
    return this.allStarTimes.find(st => st.starId === starId && st.userId === userId) || { userId: userId, starId: starId };
  }

  public getStarTimes(starId: number): StarTime[] {
    if (this.allStarTimes) {
      return this.allStarTimes.filter(st => st.starId === starId);
    }
  }
}
