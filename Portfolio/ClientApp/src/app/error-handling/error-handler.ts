import { ErrorHandler, Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { ErrorResponse } from './models/error-response';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {

    constructor(private alertService: AlertService) { }

    handleError(error: ErrorResponse): void {
        console.error(error);
        let message = error.message ? error.message : "An unspecified error occurred";
        this.alertService.showError(message, `Something Went Wrong (Error Code ${error.code})`);
    }
}
