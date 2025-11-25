import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../../shared/models/User.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base URL comes from the environment configuration.
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Store the full response in localStorage under 'auth' and the token under 'token' (if present).
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          try {
            // Save whole response
            const token = res?.access_token;
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
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  updateProfile(update: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/me`, update);
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
