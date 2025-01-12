
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const credentials = localStorage.getItem('credentials');
    if (credentials) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Basic ${credentials}`
        }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}