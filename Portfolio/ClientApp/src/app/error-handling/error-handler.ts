import { ErrorHandler } from '@angular/core';
import { AlertService } from './alert.service';

export class CustomErrorHandler implements ErrorHandler {

    constructor(private alertService: AlertService) { }

    handleError(error: any): void {
        console.error(error);
        let message = error.message ? error.message : "An unspecified error occurred";
        this.alertService.showError(message, "Something went wrong");
    }
}
