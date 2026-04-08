import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const fallbackMessage = 'Falha de comunicacao com a API.';
      const apiMessage =
        typeof error.error?.message === 'string' ? error.error.message : null;

      return throwError(() => new Error(apiMessage ?? fallbackMessage));
    })
  );