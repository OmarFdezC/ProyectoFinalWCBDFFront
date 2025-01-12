import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  username: string;
  authorities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = 'https://proyectofinalwcbdf.onrender.com/api/v1/inventory';
  private isBrowser: boolean;

  private userPasswords: { [key: string]: string } = {
    'admin': '1234',
    'user': 'user1234',
    'moderator': 'mode1234',
    'editor': 'editor1234',
    'developer': 'dev1234',
    'analyst': 'ana1234'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    let storedUser = null;

    if (this.isBrowser) {
      storedUser = localStorage.getItem('currentUser');
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
     // Verificar si las credenciales son correctas
     if (this.userPasswords[username] !== password) {
      return throwError({ status: 401, message: 'Credenciales inválidas' });
    }

    // Crear las credenciales en formato Base64
    const credentials = btoa(`${username}:${password}`);
    
    // Configurar los headers
    const headers = new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.apiUrl, { headers }).pipe(
      map(() => {
        // Asignar autoridades según el usuario
        const authorities = this.getPermissionsByRole(username);
        
        const user = {
          username,
          authorities
        };

        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('credentials', credentials);
        }

        this.currentUserSubject.next(user);
        return user;
      }),
      catchError((error) => {
        if (error.status === 404) {
          // Manejar el error 404 como una condición válida (Usuario autorizado pero sin datos)
          const authorities = this.getPermissionsByRole(username);
        
          const user = {
            username,
            authorities
          };

          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('credentials', credentials);
          }
  
          this.currentUserSubject.next(user);
          return new Observable(subscriber => {
            subscriber.next(user);
            subscriber.complete()
          })
         
        }
          
        return throwError(error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('credentials');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasAuthority(authority: string): boolean {
    const user = this.currentUserValue;
    if (!user) {
      return false;
    }
    return user.authorities.includes(authority);
  }

  getPermissionsByRole(role: string): string[] {
    const permissions: { [key: string]: string[] } = {
      admin: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
      user: ['READ'],
      moderator: ['READ', 'UPDATE'],
      editor: ['UPDATE'],
      developer: ["READ", "WRITE", "CREATE", "UPDATE", "DELETE", "CREATE-USER"],
      analyst: ['READ', 'DELETE']
    };
    return permissions[role] || [];
  }

  getAuthHeaders(): { [header: string]: string } {
    const credentials = localStorage.getItem('credentials');
    if (credentials) {
      return {
        Authorization: `Basic ${credentials}`
      };
    }
    return {};
  }
}
/*import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  username: string;
  authorities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  //private apiUrl = 'https://cbdf-aam-apicustomer.onrender.com/api/customers';
  private apiUrl = 'https://wcbdf-adl-api-expenses.onrender.com/api/v1/expenses';
  private isBrowser: boolean;

  private userPasswords: { [key: string]: string } = {
    'admin': '1234',
    'user': 'user1234',
    'moderator': 'mode1234',
    'editor': 'editor1234',
    'developer': 'dev1234',
    'analyst': 'ana1234'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    let storedUser = null;

    if (this.isBrowser) {
      storedUser = localStorage.getItem('currentUser');
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    // Verificar si las credenciales son correctas
    if (this.userPasswords[username] !== password) {
      return new Observable(subscriber => {
        subscriber.error({ status: 401, message: 'Credenciales inválidas' });
      });
    }

    // Crear las credenciales en formato Base64
    const credentials = btoa(`${username}:${password}`);
    
    // Configurar los headers
    const headers = new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.apiUrl, { headers }).pipe(
      map(() => {
        // Asignar autoridades según el usuario
        const authorities = this.getPermissionsByRole(username);
        
        const user = {
          username,
          authorities
        };

        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('credentials', credentials);
        }

        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('credentials');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasAuthority(authority: string): boolean {
    const user = this.currentUserValue;
    if (!user) {
      return false;
    }
    return user.authorities.includes(authority);
  }

  getPermissionsByRole(role: string): string[] {
    const permissions: { [key: string]: string[] } = {
      admin: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
      user: ['READ'],
      moderator: ['READ', 'UPDATE'],
      editor: ['UPDATE'],
      //developer: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
      developer: ["READ", "WRITE", "CREATE", "UPDATE", "DELETE", "CREATE-USER"],
      analyst: ['READ', 'DELETE']
    };
    return permissions[role] || [];
  }

  getAuthHeaders(): { [header: string]: string } {
    const credentials = localStorage.getItem('credentials');
    if (credentials) {
      return {
        Authorization: `Basic ${credentials}`
      };
    }
    return {};
  }
}*/

/*
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  username: string;
  authorities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = 'https://wcbdf-adl-api-expenses.onrender.com/api/v1/expenses';
  private isBrowser: boolean;

  private userPasswords: { [key: string]: string } = {
    admin: '1234',
    user: 'user1234',
    moderator: 'mode1234',
    editor: 'editor1234',
    developer: 'dev1234',
    analyst: 'ana1234',
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    const storedUser = this.isBrowser ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    // Verificar credenciales locales
    if (this.userPasswords[username] !== password) {
      return throwError({ status: 401, message: 'Credenciales inválidas' });
    }

    const credentials = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(this.apiUrl, { headers }).pipe(
      map(() => {
        const authorities = this.getPermissionsByRole(username);
        const user: User = { username, authorities };

        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('credentials', credentials);
        }

        this.currentUserSubject.next(user);
        return user;
      }),
      catchError((error) => {
        if (error.status === 404) {
          // Manejar el error 404 como una condición válida
          return throwError({ status: 404, message: 'Usuario no encontrado' });
        }
        return throwError(error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('credentials');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasAuthority(authority: string): boolean {
    const user = this.currentUserValue;
    return user ? user.authorities.includes(authority) : false;
  }

  getPermissionsByRole(role: string): string[] {
    const permissions: { [key: string]: string[] } = {
      admin: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
      user: ['READ'],
      moderator: ['READ', 'UPDATE'],
      editor: ['UPDATE'],
      developer: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE', 'CREATE-USER'],
      analyst: ['READ', 'DELETE'],
    };
    return permissions[role] || [];
  }

  getAuthHeaders(): { [header: string]: string } {
    const credentials = localStorage.getItem('credentials');
    return credentials ? { Authorization: `Basic ${credentials}` } : {};
  }
}
*/