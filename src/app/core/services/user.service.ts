import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/users';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  /**
   * Carrega o perfil do usuário autenticado
   */
  loadCurrentUser(): void {
    this.getMe().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: (err) => {
        console.error('Erro ao carregar perfil do usuário', err);
      }
    });
  }

  /**
   * Obtém os dados do usuário autenticado
   */
  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  /**
   * Obtém usuário por ID
   */
  getById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Atualiza dados do usuário autenticado
   */
  update(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/me`, data).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Obtém o usuário atual do subject (valor em cache)
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }
}
