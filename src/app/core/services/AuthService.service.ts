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
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Store the full response in localStorage under 'auth' and the token under 'token' (if present).
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          try {
            // Save whole response
            localStorage.setItem('auth', JSON.stringify(res));
            // Save token if present (support access_token or token)
            const token = res?.token ?? res?.token ?? null;
            if (token) {
              localStorage.setItem('token', token);
            }
          } catch (e) {
            // ignore storage errors (e.g., quota)
            console.warn('Failed to persist auth to localStorage', e);
          }
        })
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
