import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameNightLiveService {

  private connectionSubject: Subject<boolean> = new ReplaySubject<boolean>();
  private connection: signalR.HubConnection;

  constructor(private http: HttpClient) { 

  }

  start(): void {
    this.connection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.Trace)
    .withUrl("/gn")
    .build();

    this.startConnection();

    this.connection.onclose((err) => {
      this.connectionSubject.next(false);
      this.startConnection();
    });

    this.connection.onreconnected(() => {
      this.connectionSubject.next(true);
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
}
