import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BackendHealthService } from '../core/services/backend-health.service';
export interface CategoryTotalDto {
  categoryId: number;
  categoryName: string;
  categoryType: string;
  total: number;
  transactionCount: number;
}

export interface PeriodReportDto {
  accountId?: number;
  accountName?: string;
  startDate: string;
  endDate: string;
  previousBalance: number;
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  categorySummary: CategoryTotalDto[];
}

export interface MonthlySummaryItemDto {
  year: string;
  month: string;
  income: number;
  expenses: number;
  monthBalance: number;
  accumulatedBalance: number;
  netTransfers?: number;
}

export interface MonthlySummaryDto {
  startMonth: string;
  endMonth: string;
  items: MonthlySummaryItemDto[];
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient, private backendHealth: BackendHealthService) {}

  getPeriodReport(
    startDate: string,
    endDate: string,
    accountId?: number,
  ): Observable<PeriodReportDto> {
    let params = new HttpParams().set('startDate', startDate).set('endDate', endDate);

  if (accountId != null) params = params.set('accountId', String(accountId));
    // Debug: log full request URL for troubleshooting ownership-filter issues
    try {
      // eslint-disable-next-line no-console
      console.debug('[DashboardService] GET', `${environment.apiBaseUrl}/reports/transactions/period?${params.toString()}`);
    } catch {}
    return this.http.get<PeriodReportDto>(`${environment.apiBaseUrl}/reports/transactions/period`, { params });
  }
  /**
   * Returns a flat list of accounts (items array) from the backend paginated response.
   * Requests a large `limit` so we get all accounts for the current user.
   */
  getAccountList(): Observable<any[]> {
    const params = new HttpParams().set('limit', '100');
    return this.http
      .get<any>(`${environment.apiBaseUrl}/accounts`, { params })
      .pipe(map((res) => res?.items || []));
  }

  getMonthlySummary(
    startMonth: string,
    endMonth: string,
    accountId?: number,
  ): Observable<MonthlySummaryDto> {

    let params = new HttpParams().set('startMonth', startMonth).set('endMonth', endMonth);
  if (accountId != null) params = params.set('accountId', String(accountId));
    try {
      // eslint-disable-next-line no-console
      console.debug('[DashboardService] GET', `${environment.apiBaseUrl}/reports/transactions/monthly?${params.toString()}`);
    } catch {}
    return this.http.get<MonthlySummaryDto>(`${environment.apiBaseUrl}/reports/transactions/monthly`, { params });
  }

  /**
   * Fetch recent transactions (paginated endpoint) and return the items array.
   * Defaults to limit=10 and first page, ordered by date DESC.
   */
  getRecentTransactions(limit = 10, accountId?: number): Observable<any[]> {
    // Temporarily disabled: do not call backend /transactions endpoint to avoid triggering
    // the ownership-filter bug on the server. Return an empty list from the client.
    // This centralizes the change so no component in the frontend will issue /transactions requests.
    // eslint-disable-next-line no-console
    console.debug('[DashboardService] getRecentTransactions disabled — returning empty list');
    return of([]);
  }

  /**
   * Generic transactions fetch with optional date range and pagination.
   * Returns the `items` array from the paginated response.
   */
  getTransactions(
    limit = 1000,
    page = 1,
    accountId?: number,
    startDate?: string,
    endDate?: string,
  ): Observable<any[]> {
    // Temporarily disabled: prevent any client calls to /transactions.
    // Return an empty array so callers can continue to operate safely.
    // eslint-disable-next-line no-console
    console.debug('[DashboardService] getTransactions disabled — returning empty list');
    return of([]);
  }
}
