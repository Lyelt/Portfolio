import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BingoService {
  private reset = new Subject<any>();
  resetObservable = this.reset.asObservable();

  constructor() { }

  public resetComponents() {
    this.reset.next(null);
  }
}
