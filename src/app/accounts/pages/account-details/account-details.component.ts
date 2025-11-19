import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '../../../core/services/accounts.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-account-details',
  standalone:true,
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],

  imports: [
    CommonModule
  ],

  providers: [
      DecimalPipe
  ]
})
export class AccountDetailsComponent implements OnInit {

  accountId!: string;
  account: any;
  transactions: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountsService: AccountsService
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.params['id'];

    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.accountsService.getById(Number(this.accountId)).subscribe({
      next: (acc) => {
        this.account = acc;
        this.transactions = acc.transactions || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  back() {
    this.router.navigate(['/accounts']);
  }
}
