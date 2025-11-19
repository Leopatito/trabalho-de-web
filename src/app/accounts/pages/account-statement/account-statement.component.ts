import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountsService } from '../../../core/services/accounts.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
  ],

  providers: [
    DecimalPipe
  ],

  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.scss'] //  <-- AGORA FUNCIONA
})
export class AccountStatementComponent implements OnInit {
  accountId!: number;
  account: any;
  transactions: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountsService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.accountId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.accountService.getById(this.accountId).subscribe({
      next: (acc) => {
        this.account = acc;

        this.http
          .get<any[]>(`http://localhost:3000/accounts/${this.accountId}/transactions`)
          .subscribe({
            next: (data) => {
              this.transactions = data;
              this.loading = false;
            },
            error: (err) => {
              console.error('Erro ao buscar transações:', err);
              this.loading = false;
            },
          });
      },
      error: () => (this.loading = false),
    });
  }
}
