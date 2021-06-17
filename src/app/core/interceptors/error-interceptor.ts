import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export enum STATUS {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  UNKNOWN_ERROR = 0
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private errorPages = [
    STATUS.UNAUTHORIZED,
    STATUS.FORBIDDEN,
    STATUS.NOT_FOUND,
    STATUS.INTERNAL_SERVER_ERROR,
    STATUS.UNKNOWN_ERROR
  ];

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next
      .handle(request)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === STATUS.UNAUTHORIZED) {
      this.router.navigateByUrl('/auth/login').then();
      this.toastr.error('Incorrect(s) Password/key', 'System Alert');
    } else if (error.status === STATUS.UNKNOWN_ERROR) {
      this.toastr.error('Unknown error. Try again later!', 'System Alert');
    } else if (this.errorPages.includes(error.status)) {
      this.router.navigateByUrl(`/sessions/${error.status}`, {
        skipLocationChange: true,
      }).then();
    } else if (error instanceof HttpErrorResponse) {
      console.error('ERROR', error);
      this.toastr.error(error.error.msg || `${error.status} ${error.statusText}`);
    }

    return throwError(error);
  }
}
