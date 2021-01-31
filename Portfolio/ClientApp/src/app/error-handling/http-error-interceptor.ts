import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) { }

    handleError(error: HttpErrorResponse) {
        if (error.error)
            this.alertService.showHttpError(error.error, `Something Went Wrong (${error.error.code})`);
        else
            this.alertService.showError("An unspecified server error occurred", "Something Went Wrong");
        return throwError(error);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req)
            .pipe(
                catchError((err: HttpErrorResponse) => this.handleError(err))
            );
    };
}
