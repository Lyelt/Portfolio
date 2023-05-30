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

  private outsideDogSubject: Subject<Dog> = new ReplaySubject<Dog>();
  private dogNudgedSubject: Subject<Dog> = new ReplaySubject<Dog>();
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

    this.connection.start().then(function(){
      console.log('SignalR Connected!');
    }).catch(function(err) {
      return console.error(err.toString());
    });

    this.connection.on("dogToggled", (dog: Dog) => {
      console.log("dog toggled: " + dog);
      this.outsideDogSubject.next(dog);
    });

    this.connection.on("dogNudged", (dog: Dog) => {
      console.log("dog nudged: " + dog);
      this.dogNudgedSubject.next(dog);
    });
  }

  toggleOutsideDog(dog: Dog): void {
    this.connection.send('toggleDog', dog);
  }

  nudge(dog: Dog): void {
    this.connection.send('nudge', dog);
  }

  public outsideDog(): Observable<Dog> {
    return this.outsideDogSubject.asObservable();
  }

  public onNudge(): Observable<Dog> {
    return this.dogNudgedSubject.asObservable();
  }
  
  public getDogOwners() {
    return this.http.get<User[]>("Dog/GetUsers");
  }

  public getRecentDogTimes(quantity: number) {
    return this.http.get<DogTime[]>(`Dog/GetDogTimes/${quantity}`);
  }
}
