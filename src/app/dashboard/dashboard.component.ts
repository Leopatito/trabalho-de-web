import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../core/services/AuthService.service';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
export * from './dashboard.service';
export * from './dashboard.component';

@Component({
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, RouterModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  periodReport: any = null;
  monthlySummary: any = null;
  accounts: any[] = [];
  selectedAccountId: number | null = null;
  // period selector: '1m' | '3m' | '6m' | 'custom'
  selectedPeriod: string = '1m';
  customStart?: string | null = null; // yyyy-mm-dd
  customEnd?: string | null = null;
  // ng2-charts bindings (use loose typing to avoid library type mismatches)
  pieChartData: any = { labels: [], datasets: [{ data: [] }] };
  pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#ffffff' } },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            // show value and percentage in tooltip
            const dataset = context.dataset;
            const data = dataset && dataset.data ? dataset.data : [];
            const value = context.parsed ?? context.raw ?? 0;
            const total = data.reduce((acc: number, v: any) => acc + Number(v || 0), 0);
            const pct = total ? Math.round((Number(value) / total) * 100) : 0;
            return `${context.label}: ${Number(value).toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  monthlyChartData: any = { labels: [], datasets: [] };
  monthlyChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };
  loading = false;
  error: string | null = null;
  // header/profile are handled by the global Header component now

  constructor(private dashboard: DashboardService, private authService: AuthService, private router: Router) {}



  ngOnInit(): void {
    this.loadAccounts();
    // Overview (cards + monthly chart) always shows last 6 months
    this.loadOverviewData();
    // Pie chart is controlled by the period selector (default '1m')
    this.loadPieChart();
    // Header component handles profile/avatar now
  }

  ngOnDestroy(): void {
    // nothing to cleanup here related to header
  }

  setPeriod(period: string) {
    this.selectedPeriod = period;
    // clear custom dates when switching presets
    if (period !== 'custom') {
      this.customStart = null;
      this.customEnd = null;
      this.loadPieChart();
    }
  }

  applyCustomPeriod() {
    if (!this.customStart || !this.customEnd) {
      this.error = 'Informe as datas de início e fim.';
      return;
    }
    const start = new Date(this.customStart);
    const end = new Date(this.customEnd);
    if (start > end) {
      this.error = 'A data inicial deve ser anterior à data final.';
      return;
    }
    this.error = null;
    this.loadPieChart();
  }

  loadAccounts() {
    this.dashboard.getAccountList().subscribe((list: any[]) => {
      this.accounts = list || [];
    }, (err) => {
      console.warn('Failed to load accounts', err);
    });
  }

  // Header-related methods were moved to the global HeaderComponent

  onAccountChange(value: string | number) {
    const id = value === '' || value === null ? null : Number(value);
    this.selectedAccountId = id;
    // Update overview and pie chart when account changes
    this.loadOverviewData();
    this.loadPieChart();
  }
  /**
   * Load the dashboard overview (cards + monthly chart) always using the last 6 months.
   */
  loadOverviewData() {
    this.loading = true;
    this.error = null;

    const now = new Date();
    // last 6 months (including current month)
    const monthsCount = 6;
    const monthlyEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthlyStartDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);

    const periodStart = new Date(monthlyStartDate.getFullYear(), monthlyStartDate.getMonth(), 1);
    const periodEnd = new Date(monthlyEnd.getFullYear(), monthlyEnd.getMonth(), monthlyEnd.getDate(), 23, 59, 59);

  const periodStartISO = periodStart.toISOString();
  const periodEndISO = periodEnd.toISOString();

    // If no account is selected, DO NOT call /transactions for the full dataset
    // because the backend may apply a global owner filter that crashes on
    // Transaction entities. Instead, build a minimal overview from local
    // account balances and leave category/monthly summaries empty with a hint.
    if (this.selectedAccountId == null) {
      // Aggregate currentBalance across accounts as a lightweight overview
      const currentBalance = this.accounts.reduce((acc, a) => acc + Number(a.currentBalance || 0), 0);
      this.periodReport = {
        accountId: undefined,
        startDate: periodStartISO,
        endDate: periodEndISO,
        previousBalance: currentBalance, // best-effort
        currentBalance,
        totalIncome: 0,
        totalExpenses: 0,
        savings: 0,
        categorySummary: [],
      };
  this.monthlySummary = null as any;
  this.loading = false;
      return;
    }

    // Account is selected — safe to request transactions filtered by account
    this.dashboard
      .getTransactions(1000, 1, this.selectedAccountId, periodStartISO, periodEndISO)
      .pipe(
        catchError((err) => {
          console.error('Failed to load transactions for overview', err);
          this.error = 'Falha ao carregar dados do período.';
          return of([] as any);
        }),
        finalize(() => (this.loading = false)),
      )
      .subscribe((items: any[]) => {
        const txs = items || [];

        // Aggregate totals
        const totalIncome = txs.reduce((acc, t) => {
          const type = t.category?.type || '';
          return acc + (type === 'Receita' ? Number(t.amount || 0) : 0);
        }, 0);
        const totalExpenses = txs.reduce((acc, t) => {
          const type = t.category?.type || '';
          return acc + (type === 'Despesa' ? Number(t.amount || 0) : 0);
        }, 0);

        const acct = this.accounts.find((a) => Number(a.id) === Number(this.selectedAccountId));
        const currentBalance = acct ? Number(acct.currentBalance || 0) : 0;
        const savings = totalIncome - totalExpenses;
        const previousBalance = currentBalance - savings; // approximate previous balance

        // Build category summary
        const categoryMap = new Map<string, any>();
        txs.forEach((t) => {
          const id = t.category?.id || t.category?.name || 'uncategorized';
          const name = t.category?.name || 'Sem categoria';
          const type = t.category?.type || 'Despesa';
          const key = `${id}`;
          const entry = categoryMap.get(key) || { categoryId: id, categoryName: name, categoryType: type, total: 0, transactionCount: 0 };
          entry.total += Number(t.amount || 0);
          entry.transactionCount += 1;
          categoryMap.set(key, entry);
        });

        this.periodReport = {
          accountId: this.selectedAccountId || undefined,
          startDate: periodStartISO,
          endDate: periodEndISO,
          previousBalance,
          currentBalance,
          totalIncome,
          totalExpenses,
          savings,
          categorySummary: Array.from(categoryMap.values()),
        };

        // Build monthly summary for last 6 months
        const months: any[] = [];
        const cursor = new Date(monthlyStartDate.getFullYear(), monthlyStartDate.getMonth(), 1);
        while (cursor <= monthlyEnd) {
          const year = cursor.getFullYear();
          const month = cursor.getMonth() + 1;
          const monthStart = new Date(year, cursor.getMonth(), 1);
          const monthEnd = new Date(year, cursor.getMonth() + 1, 0, 23, 59, 59);
          const monthTx = txs.filter((t) => {
            const d = new Date(t.date);
            return d >= monthStart && d <= monthEnd;
          });
          const income = monthTx.reduce((acc, t) => acc + (t.category?.type === 'Receita' ? Number(t.amount || 0) : 0), 0);
          const expenses = monthTx.reduce((acc, t) => acc + (t.category?.type === 'Despesa' ? Number(t.amount || 0) : 0), 0);
          const monthBalance = income - expenses;
          months.push({ year, month: String(month).padStart(2, '0'), income, expenses, monthBalance });
          cursor.setMonth(cursor.getMonth() + 1);
        }

        this.monthlySummary = {
          startMonth: `${monthlyStartDate.getFullYear()}-${String(monthlyStartDate.getMonth() + 1).padStart(2, '0')}`,
          endMonth: `${monthlyEnd.getFullYear()}-${String(monthlyEnd.getMonth() + 1).padStart(2, '0')}`,
          items: months,
          totalIncome: totalIncome,
          totalExpenses: totalExpenses,
          totalSavings: savings,
        };

        this.monthlyChartData.labels = months.map((x: any) => `${x.month}/${x.year}`);
        this.monthlyChartData.datasets = [
          { label: 'Receitas', data: months.map((x: any) => x.income), backgroundColor: '#4caf50' },
          { label: 'Despesas', data: months.map((x: any) => x.expenses), backgroundColor: '#f44336' },
          { label: 'Saldo', data: months.map((x: any) => x.monthBalance), type: 'line', borderColor: '#2196f3', fill: false },
        ];
      });
  }

  /**
   * Load only the pie chart according to the selected period (1m/3m/6m/custom).
   */
  loadPieChart() {
    // compute period for pie chart based on selectedPeriod or custom dates
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    if (this.selectedPeriod === 'custom') {
      if (!this.customStart || !this.customEnd) {
        // nothing to load
        return;
      }
      periodStart = new Date(this.customStart + 'T00:00:00');
      periodEnd = new Date(this.customEnd + 'T23:59:59');
    } else {
      const days = this.selectedPeriod === '1m' ? 30 : this.selectedPeriod === '3m' ? 90 : 180;
      periodEnd = new Date(now);
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - days);
    }

    const periodStartISO = periodStart.toISOString();
    const periodEndISO = periodEnd.toISOString();

    // If no account selected, avoid requesting transactions for all users
    if (this.selectedAccountId == null) {
      this.pieChartData.labels = [];
      this.pieChartData.datasets = [{ data: [] }];
      return;
    }

    this.dashboard
      .getTransactions(1000, 1, this.selectedAccountId, periodStartISO, periodEndISO)
      .pipe(
        catchError((err) => {
          console.error('Failed to load pie chart period report', err);
          // keep existing pie data but set an error flag
          this.error = this.error ? this.error + ' Falha ao carregar gráfico de categorias.' : 'Falha ao carregar gráfico de categorias.';
          return of(null as any);
        }),
      )
      .subscribe((txs: any[]) => {
        const items = txs || [];
        // compute category totals from transactions
        const categoryMap = new Map<string, any>();
        items.forEach((t) => {
          const id = t.category?.id || t.category?.name || 'uncategorized';
          const name = t.category?.name || 'Sem categoria';
          const type = t.category?.type || 'Despesa';
          const key = `${id}`;
          const entry = categoryMap.get(key) || { categoryId: id, categoryName: name, categoryType: type, total: 0, transactionCount: 0 };
          entry.total += Number(t.amount || 0);
          entry.transactionCount += 1;
          categoryMap.set(key, entry);
        });
        const categories = Array.from(categoryMap.values());
        this.pieChartData.labels = categories.map((c: any) => c.categoryName);
        this.pieChartData.datasets = [
          { data: categories.map((c: any) => c.total), backgroundColor: categories.map((_: any, i: number) => this.pickColor(i)) },
        ];
      });
  }

  pickColor(i: number) {
    const palette = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6', '#DD4477', '#66AA00'];
    return palette[i % palette.length];
  }

  // trackBy for category list to improve rendering performance
  trackByCategory(_: number, item: any) {
    return item && item.categoryId ? item.categoryId : _;
  }
}
