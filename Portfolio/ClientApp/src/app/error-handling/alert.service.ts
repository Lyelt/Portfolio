import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

    constructor() { }

    public showError(message: string, title: string): void {
        // TODO - display error popup
        alert(title + "\r\n" + message);
    }

    public showHttpError(error: HttpErrorResponse, title: string): void {
        this.showError(error.message, title);
    }
}
