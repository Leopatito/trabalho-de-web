import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountsService } from '../../core/services/accounts.service';
import { CategoriesService } from '../../features/categories/categories.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class TransactionsListComponent implements OnInit {
  // Sidebar
  isCollapsed: boolean = true;

  // User
  userName = '';
  userAvatar = '';

  // Data
  transactions: any[] = [];
  accounts: any[] = [];
  categories: any[] = [];
  loading = false;
  error = '';

  // Filters
  selectedAccountId: number | null = null;
  selectedCategoryId: number | null = null;
  selectedType: string = ''; // 'INCOME', 'EXPENSE', 'TRANSFER', ''
  startDate: string = '';
  endDate: string = '';

  // Modal
  modalOpen = false;
  editingTransaction: any = null;

  // Form
  transactionForm = {
    description: '',
    amount: 0,
    date: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE' | 'TRANSFER',
    accountId: 0 as number | null,
    categoryId: 0 as number | null,
    destinationAccountId: 0 as number | null // Para transferências
  };

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  // Utility
  Math = Math;

  constructor(
    private transactionService: TransactionService,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadAccounts();
    this.loadCategories();
    this.loadTransactions();
  }

  loadUserData(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.userName = user.name;
        this.userAvatar = user.avatar || '';
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário', err);
      }
    });
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  loadAccounts() {
    this.accountsService.getAll().subscribe({
      next: (res) => {
        this.accounts = res.items || [];
      },
      error: (err) => {
        console.error('Erro ao carregar contas', err);
        this.error = 'Erro ao carregar contas';
      }
    });
  }

  loadCategories() {
    this.categoriesService.listAll().subscribe({
      next: (res: any) => {
        this.categories = res || [];
      },
      error: (err) => {
        console.error('Erro ao carregar categorias', err);
      }
    });
  }

  loadTransactions() {
    this.loading = true;

    // Construir parâmetros de query
    const params: any = {};
    if (this.selectedAccountId) params.accountId = this.selectedAccountId;
    if (this.selectedType) params.type = this.selectedType;
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;
    if (this.selectedCategoryId) params.categoryId = this.selectedCategoryId;

    this.transactionService.getAll(params).subscribe({
      next: (res: any) => {
        this.transactions = (res.items || []).sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        this.totalItems = this.transactions.length;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar lançamentos', err);
        this.error = 'Erro ao carregar lançamentos';
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadTransactions();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  openModal(transaction?: any) {
    if (transaction) {
      this.editingTransaction = transaction;
      this.transactionForm = {
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        destinationAccountId: transaction.destinationAccountId
      };
    } else {
      this.editingTransaction = null;
      this.resetForm();
    }
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.transactionForm = {
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      accountId: null,
      categoryId: null,
      destinationAccountId: null
    };
  }

  saveTransaction() {
    if (!this.transactionForm.accountId || !this.transactionForm.amount) {
      this.error = 'Conta e valor são obrigatórios';
      return;
    }

    const payload: any = {
      description: this.transactionForm.description,
      amount: this.transactionForm.amount,
      date: this.transactionForm.date,
      type: this.transactionForm.type,
      accountId: Number(this.transactionForm.accountId),
      categoryId: this.transactionForm.categoryId ? Number(this.transactionForm.categoryId) : null,
      destinationAccountId: this.transactionForm.destinationAccountId ? Number(this.transactionForm.destinationAccountId) : null
    };

    if (this.editingTransaction) {
      // Atualizar
      this.transactionService.update(this.editingTransaction.id, payload).subscribe({
        next: () => {
          this.updateAccountBalances();
          this.loadTransactions();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Erro ao atualizar', err);
          this.error = 'Erro ao atualizar lançamento';
        }
      });
    } else {
      // Criar novo
      this.transactionService.create(payload).subscribe({
        next: () => {
          this.updateAccountBalances();
          this.loadTransactions();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Erro ao criar', err);
          this.error = 'Erro ao criar lançamento';
        }
      });
    }
  }

  updateAccountBalances() {
    // Recarregar contas para atualizar saldos
    this.loadAccounts();
  }

  deleteTransaction(id: number) {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

    this.transactionService.delete(id).subscribe({
      next: () => {
        this.loadTransactions();
      },
      error: (err: any) => {
        console.error('Erro ao excluir', err);
        this.error = 'Erro ao excluir lançamento';
      }
    });
  }

  formatTransactionType(type: string): string {
    // Converter tipos vindos do backend para o padrão esperado
    if (type === 'transaction' || !type) return 'EXPENSE';
    return type;
  }

  getTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'INCOME': 'Receita',
      'EXPENSE': 'Despesa',
      'TRANSFER': 'Transferência'
    };
    return typeMap[type] || type;
  }

  getTypeClass(type: string): string {
    const typeClass: { [key: string]: string } = {
      'INCOME': 'income',
      'EXPENSE': 'expense',
      'TRANSFER': 'transfer'
    };
    return typeClass[type] || '';
  }

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return '-';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '-';
  }

  // Pagination
  get paginatedTransactions() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.transactions.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }
}
