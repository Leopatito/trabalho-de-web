import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account } from '../../shared/models/account.model';
import { AccountsResponse } from '../../interface/account-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  private apiUrl = 'http://localhost:3000';

  private readonly api = `${environment.apiBaseUrl}/accounts`;

  constructor(private http: HttpClient) {}

  /** Lista todas as contas do usuário logado */
  getAll(): Observable<AccountsResponse> {
    return this.http.get<AccountsResponse>(`${this.apiUrl}/accounts`);
  }

  /** Busca uma conta específica */
  getById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.api}/${id}`);
  }

  /** Cria uma nova conta */
  create(account: Account): Observable<Account> {
    return this.http.post<Account>(this.api, account);
  }

  /** Atualiza conta (backend já valida regras) */
  update(id: number, account: Account): Observable<Account> {
    return this.http.patch<Account>(`${this.api}/${id}`, account);
  }

  /** Exclui conta (bloqueado pelo backend se houver lançamentos) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  /** Carrega extrato da conta selecionada */
  getStatement(accountId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${accountId}/statement`);
  }
}
