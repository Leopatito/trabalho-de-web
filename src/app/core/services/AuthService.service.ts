import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../../shared/models/User.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use relative URLs so the Angular dev-server proxy (proxy.conf.json) can forward requests to the API.
  // This avoids CORS in development. In production, replace with an environment-specific base URL.
  private apiUrl = 'http://localhost:4200';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<User> {
    // If your backend uses cookies for auth, add { withCredentials: true } as the third argument.
    return this.http.post<User>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(user => localStorage.setItem('token', <string>user.token))
      );
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }
}
