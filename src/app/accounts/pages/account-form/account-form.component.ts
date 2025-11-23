import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountsService } from '../../../core/services/accounts.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ACCOUNT_ICONS } from '../../../shared/icons/fontawesome-icons';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  standalone: true,
  styleUrls: ['./account-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AccountFormComponent implements OnInit {

  form!: FormGroup;
  isEdit = false;
  accountId!: string;
  loading = false;
  originalName = '';

  icons = ACCOUNT_ICONS;
  selectedIcon: string | null = null;

  accountTypes = [
    { value: 'CHECKING', label: 'Conta Corrente' },
    { value: 'SAVINGS', label: 'Conta Poupança' },
    { value: 'LOAN', label: 'Conta de Investimento' },
    { value: 'OTHER', label: 'Outros' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountsService: AccountsService
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],

      initialBalance: [0, Validators.required],

      currentBalance: [null],

      color: ['#000000', Validators.required],

      icon: [null],

      isActive: [true, Validators.required]
    });

    this.accountId = this.route.snapshot.params['id'];
    this.isEdit = !!this.accountId;

    if (this.isEdit) {
      this.loadAccount();
    }
  }

  loadAccount() {
    this.loading = true;

    this.accountsService.getById(Number(this.accountId)).subscribe({
      next: (acc) => {

        this.originalName = acc.name;
        this.selectedIcon = acc.icon || null;

        this.form.patchValue({
          name: acc.name,
          type: acc.type,
          initialBalance: acc.initialBalance,
          currentBalance: acc.currentBalance,
          icon: acc.icon,
          isActive: acc.isActive
        });

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  submit() {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();
    payload.icon = this.selectedIcon;

    if (this.isEdit && payload.name === this.originalName) {
      delete payload.name;
    }

    this.loading = true;

    if (this.isEdit) {
      this.accountsService.update(Number(this.accountId), payload)
        .subscribe(() => this.router.navigate(['/accounts']));

    } else {
      delete payload.currentBalance;

      this.accountsService.create(payload)
        .subscribe(() => this.router.navigate(['/accounts']));
    }
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }
}
