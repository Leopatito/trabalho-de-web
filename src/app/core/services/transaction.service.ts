import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    type: 'INCOME' | 'EXPENSE';
    description: string;
    date: Date | string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getByAccount(accountId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/account/${accountId}`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
