import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiListResponse } from '../../core/models/api-response.model';
import { Observable } from 'rxjs';
import { Goal } from '../../core/models/goals.model';

@Injectable({ providedIn: 'root' })
export class GoalsService {

  private baseUrl = `${environment.apiBaseUrl}/goals`;

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<ApiListResponse<Goal>> {
    return this.http.get<ApiListResponse<Goal>>(this.baseUrl, {
      params: new HttpParams({ fromObject: params || {} })
    });
  }

  getById(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.baseUrl}/${id}`);
  }

  create(dto: any): Observable<Goal> {
    return this.http.post<Goal>(this.baseUrl, dto);
  }

  update(id: number, dto: any): Observable<Goal> {
    return this.http.patch<Goal>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
