import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface CategoryDto {
  id?: number;
  name: string;
  type: 'Receita' | 'Despesa' | string;
  isDefault?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private base = `${environment.apiBaseUrl}/categories`;
  constructor(private http: HttpClient) {}

  listAll(): Observable<CategoryDto[]> {
    const params = new HttpParams().set('limit', '100');
    return this.http.get<any>(this.base, { params }).pipe(map((r) => r?.items || []));
  }

  create(payload: Partial<CategoryDto>) {
    return this.http.post<CategoryDto>(this.base, payload);
  }

  update(id: number, payload: Partial<CategoryDto>) {
    return this.http.patch<CategoryDto>(`${this.base}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
