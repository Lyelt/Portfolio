import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  public sideNav: MatDrawer;
  constructor() { }
}
