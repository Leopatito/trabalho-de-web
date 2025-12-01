import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalType } from '../../../core/models/goals.model';
import { GoalsService } from '../../../core/services/goals.service';
import { AccountsService } from '../../../core/services/accounts.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-goals-page',
  standalone: true,
  templateUrl: './goals-page.component.html',
  styleUrls: ['./goals-page.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class GoalsPageComponent implements OnInit {
  accounts: any[] = [];
  selectedAccountId: number | null = null;
  goals: any[] = [];
  loading = false;
  error = '';
  modalOpen = false;
  userName = '';
  userAvatar = '';

  addValueModalOpen = false;
  withdrawModalOpen = false;

  selectedGoal: any = null;
  valueToAdd: number = 0;
  valueToWithdraw: number = 0;

  goalForm = {
    description: '',
    targetValue: 1,
    startDate: '',
    endDate: '',
    type: 'POUPANCA' as GoalType
  };

  constructor(
    private goalService: GoalsService,
    private accountService: AccountsService,
    private transactionService: TransactionService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadGoals();
    this.loadAccounts();
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

  loadGoals() {
    this.loading = true;

    this.goalService.getAll().subscribe({
      next: (res) => {
        const list = res?.items ?? [];
        this.goals = list.map(g => this.computeGoal(g));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar metas';
        this.loading = false;
      }
    });
  }

  loadAccounts() {
    this.accountService.getAll().subscribe({
      next: (res) => {
        this.accounts = res.items;
      },
      error: () => {
        this.error = 'Erro ao carregar contas';
      }
    });
  }

  computeGoal(g: any) {
    const accumulated = g.accumulatedValue ?? 0;
    const target = g.targetValue ?? 1;
    const progress = Number(((accumulated / target) * 100).toFixed(2));

    const today = new Date();
    const start = g.startDate ? new Date(g.startDate) : null;
    const end = g.endDate ? new Date(g.endDate) : null;

    let status = 'Em andamento';

    const reached = accumulated >= target;
    const expired = end && today.getTime() > end.getTime();

    switch (g.type) {
      case 'POUPANCA':
      case 'INVESTIMENTO':
      case 'COMPRA':
      case 'DIVIDA':
      case 'ORCAMENTO':
        if (reached) status = 'Concluida';
        else if (expired) status = 'Expirada';
        else status = 'Em andamento';
        break;

      case 'LIMITE':
        if (accumulated > target) status = 'Excedida';
        else status = 'Limite disponível';
        break;

      default:
        status = 'Em andamento';
    }

    return {
      ...g,
      description: g.description ?? 'Meta sem descrição',
      currentValue: accumulated,
      progress,
      startDate: start,
      endDate: end,
      status: status.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
    };

  }

  isCollapsed: boolean = true;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  openModal() {
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.goalForm = {
      description: '',
      targetValue: 1,
      startDate: '',
      endDate: '',
      type: 'POUPANCA'
    };
  }

  saveGoal() {
    if (!this.validateGoalForm()) {
      return;
    }

    const payload = {
      description: this.goalForm.description,
      type: this.goalForm.type,
      targetValue: this.goalForm.targetValue,
      startDate: this.goalForm.startDate,
      endDate: this.goalForm.endDate,
      accumulatedValue: 0
    };

    this.goalService.create(payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadGoals();
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao salvar meta');
      }
    });
  }

  validateGoalForm(): boolean {
    if (!this.goalForm.description.trim()) {
      alert('Informe uma descrição para a meta');
      return false;
    }

    if (this.goalForm.targetValue <= 0) {
      alert('O valor alvo deve ser maior que zero');
      return false;
    }

    if (!this.goalForm.startDate || !this.goalForm.endDate) {
      alert('Informe as datas de início e término');
      return false;
    }

    const startDate = new Date(this.goalForm.startDate);
    const endDate = new Date(this.goalForm.endDate);

    if (endDate <= startDate) {
      alert('A data de término deve ser posterior à data de início');
      return false;
    }

    return true;
  }

  deleteGoal(id: number) {
    const goal = this.goals.find(g => g.id === id);

    if (goal && goal.accumulatedValue > 0) {
      alert("Você só pode excluir metas que não possuem valor acumulado.");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta meta?")) {
      return;
    }

    this.goalService.delete(id).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: (err) => {
        console.error(err);
        alert("Erro ao excluir a meta.");
      }
    });
  }

  // =======================
  // 🔵 ADICIONAR VALOR
  // =======================
  openAddValueModal(goal: any) {
    this.selectedGoal = goal;
    this.valueToAdd = 0;
    this.selectedAccountId = null;
    this.addValueModalOpen = true;
  }

  closeAddValueModal() {
    this.addValueModalOpen = false;
    this.selectedGoal = null;
    this.valueToAdd = 0;
    this.selectedAccountId = null;
  }

  onAccountChange(event: any) {
    this.selectedAccountId = Number(event.target.value);
  }

  confirmAddValue() {
    if (!this.valueToAdd || this.valueToAdd <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (this.selectedAccountId === null) {
      alert("Selecione uma conta.");
      return;
    }

    const accountId = this.selectedAccountId;

    this.accountService.getById(accountId).subscribe({
      next: (account) => {
        if (account.currentBalance < this.valueToAdd) {
          alert("Saldo insuficiente na conta.");
          return;
        }

        this.accountService.updateBalance(accountId, -this.valueToAdd).subscribe({
          next: () => {

            // Criar transação APÓS atualizar o saldo
            this.transactionService.create({
              accountId,
              amount: -this.valueToAdd,
              type: 'EXPENSE',
              description: `Valor adicionado à meta ${this.selectedGoal.description}`,
              date: new Date()
            }).subscribe();

            const newAccumulatedValue =
              (this.selectedGoal.accumulatedValue ?? 0) + this.valueToAdd;

            const payload = { accumulatedValue: newAccumulatedValue };

            this.goalService.update(this.selectedGoal.id, payload).subscribe({
              next: () => {
                this.closeAddValueModal();
                this.loadGoals();
              },
              error: () => alert("Erro ao adicionar valor à meta.")
            });
          },
          error: () => alert("Erro ao atualizar o saldo da conta.")
        });
      },
      error: () => alert("Erro ao buscar a conta.")
    });
  }

  openWithdrawModal(goal: any) {
    this.selectedGoal = goal;
    this.valueToWithdraw = 0;
    this.selectedAccountId = null;
    this.withdrawModalOpen = true;
  }

  closeWithdrawModal() {
    this.withdrawModalOpen = false;
    this.selectedGoal = null;
    this.valueToWithdraw = 0;
    this.selectedAccountId = null;
  }

  confirmWithdraw() {
    if (!this.valueToWithdraw || this.valueToWithdraw <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (this.selectedAccountId === null) {
      alert("Selecione uma conta.");
      return;
    }

    if (this.selectedGoal.accumulatedValue < this.valueToWithdraw) {
      alert("A meta não possui saldo suficiente.");
      return;
    }

    const accountId = this.selectedAccountId;

    this.accountService.updateBalance(accountId, this.valueToWithdraw).subscribe({
      next: () => {

        this.transactionService.create({
          accountId,
          amount: this.valueToWithdraw,
          type: 'INCOME',
          description: `Saque da meta ${this.selectedGoal.description}`,
          date: new Date()
        }).subscribe();

        const newAccumulatedValue =
          this.selectedGoal.accumulatedValue - this.valueToWithdraw;

        const payload = { accumulatedValue: newAccumulatedValue };

        this.goalService.update(this.selectedGoal.id, payload).subscribe({
          next: () => {
            this.closeWithdrawModal();
            this.loadGoals();
          },
          error: () => alert("Erro ao atualizar a meta.")
        });
      },
      error: () => alert("Erro ao atualizar saldo da conta.")
    });
  }
}
