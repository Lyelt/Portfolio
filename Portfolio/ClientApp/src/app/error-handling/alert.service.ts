import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

    public alertTitle: string;
    public alertMessage: string;
    public isVisible: boolean;

    constructor() { }

    public showError(message: string, title: string): void {
        this.alertTitle = title;
        this.alertMessage = message;
        this.isVisible = true;
    }

    public showHttpError(error: HttpErrorResponse, title: string): void {
        this.showError(error.message, title);
    }

    public hideError() {
        this.isVisible = false;
    }
}
