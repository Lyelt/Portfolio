import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {  Observable, ReplaySubject, Subject } from 'rxjs';
import { User } from '../../auth/user';
import { Dog, DogTime } from '../models/dog';

@Injectable({
  providedIn: 'root'
})
export class DogService {

  private connectionSubject: Subject<boolean> = new ReplaySubject<boolean>();
  private outsideDogSubject: Subject<Dog> = new ReplaySubject<Dog>();
  private dogNudgedSubject: Subject<Dog> = new ReplaySubject<Dog>();
  private nudgeAcknowledgedSubject: Subject<Dog> = new ReplaySubject<Dog>();
  private connection: signalR.HubConnection;
  
  constructor(private http: HttpClient) { }

  start(): void {
    this.http.get<Dog>("Dog/Outside").subscribe(d => {
      this.outsideDogSubject.next(d);
    });

    this.connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl("/dogs")
      .build();

    this.startConnection();

    this.connection.onclose((err) => {
      this.connectionSubject.next(false);
      this.startConnection();
    });

    this.connection.onreconnected(() => {
      this.connectionSubject.next(true);
    });

    this.connection.on("dogToggled", (dog: Dog) => {
      console.log("dog toggled: " + dog);
      this.outsideDogSubject.next(dog);
    });

    this.connection.on("dogNudged", (dog: Dog) => {
      console.log("dog nudged: " + dog);
      this.dogNudgedSubject.next(dog);
    });

    this.connection.on("nudgeAcknowledged", (dog: Dog) => {
      console.log("nudge acknowledged: " + dog);
      this.nudgeAcknowledgedSubject.next(dog);
    });
  }

  startConnection() {
    this.connection.start().then(() => {
      console.log('SignalR Connected!');
      this.connectionSubject.next(true);
    }).catch((err) => {
      this.connectionSubject.next(false);
      console.error(err.toString());
    });
  }
  
  toggleOutsideDog(dog: Dog): void {
    this.connection.send('toggleDog', dog);
  }

  nudge(dog: Dog): void {
    this.connection.send('nudge', dog);
  }

  acknowledgeNudge(dog: Dog): void {
    this.connection.send('acknowledgeNudge', dog);
  }

  public outsideDog(): Observable<Dog> {
    return this.outsideDogSubject.asObservable();
  }

  public onNudge(): Observable<Dog> {
    return this.dogNudgedSubject.asObservable();
  }

  public onNudgeAcknowledged(): Observable<Dog> {
    return this.nudgeAcknowledgedSubject.asObservable();
  }
  
  public getDogOwners() {
    return this.http.get<User[]>("Dog/GetUsers");
  }

  public getRecentDogTimes(quantity: number) {
    return this.http.get<DogTime[]>(`Dog/GetDogTimes/${quantity}`);
  }

  public onConnectionStatusChange(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }
}
