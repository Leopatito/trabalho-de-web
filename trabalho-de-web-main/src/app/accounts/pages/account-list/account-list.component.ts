import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../../../core/services/accounts.service';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
  imports: [
    CommonModule,   
    NgIf,
    NgForOf,
    CurrencyPipe,
    RouterModule,
  ]
})
export class AccountsListComponent implements OnInit {
  isCollapsed: boolean = true;
  accounts: any[] = [];
  loading = true;

  constructor(
    private accountsService: AccountsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  // 🔥 ADICIONE A FUNÇÃO AQUI DENTRO DA CLASSE AccountsListComponent
  getAccountTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'CHECKING': 'Conta Corrente',
      'SAVINGS': 'Conta Poupança',
      'LOAN': 'Conta de Investimento', 
      'OTHER': 'Outro'
    };
    
    return typeMap[type] || type;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  loadAccounts() {
    this.loading = true;

    this.accountsService.getAll().subscribe({
      next: (response) => {
        this.accounts = response.items || [];
        this.loading = false;
        
        // Debug para verificar os dados
        console.log('Contas carregadas:', this.accounts);
      },
      error: (error) => {
        console.error('Erro:', error);
        this.loading = false;
        this.accounts = [];
      }
    });
  }

  newAccount() {
    this.router.navigate(['/accounts/new']);
  }

  edit(id: number) {
    this.router.navigate([`/accounts/${id}/edit`]);
  }

  statement(id: number) {
    this.router.navigate(['/accounts', id, 'statement']);
  }

  delete(acc: any) {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

    this.accountsService.delete(acc.id).subscribe(() => {
      this.loadAccounts();
    });
  }
}