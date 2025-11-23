import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BackendHealthService } from '../services/backend-health.service';

@Injectable()
export class BackendErrorInterceptor implements HttpInterceptor {
  constructor(private backendHealth: BackendHealthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        try {
          const text = (err.error && typeof err.error === 'string') ? err.error : (err.message || err.error?.message || '');
          if (typeof text === 'string' && text.includes('Property "user" was not found in "Transaction"')) {
            // mark backend as broken so we avoid further calls that could crash it
            this.backendHealth.setBroken(true);
            // notify user once
            // eslint-disable-next-line no-alert
            alert('O servidor encontrou um erro interno relacionado a filtros de proprietário e está desabilitado temporariamente. Reinicie o servidor.');
          }
        } catch (e) {
          // ignore
        }
        return throwError(() => err);
      }),
    );
  }
}
