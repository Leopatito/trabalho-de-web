import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'http://localhost:3000/transactions'; // ajuste se necessário

  constructor(private http: HttpClient) {}

  create(payload: {
    accountId: number;
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    description: string;
    date: Date | string;
    categoryId?: number | null;
    destinationAccountId?: number | null;
  }): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  getAll(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, payload);
  }

  getByAccount(accountId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/account/${accountId}`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
