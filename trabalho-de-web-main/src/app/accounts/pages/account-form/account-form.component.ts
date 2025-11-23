import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountsService } from '../../../core/services/accounts.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  standalone: true,
  styleUrls: ['./account-form.component.scss'],

  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class AccountFormComponent implements OnInit {

  form!: FormGroup;
  isEdit = false;
  accountId!: string;
  loading = false;
  disableInitialBalance = false;

  originalName = '';

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
      color: ['#000000', Validators.required],
      icon: [''],

      // 🔥 O backend OBRIGA esse campo → então ele PRECISA existir no form
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

        this.form.patchValue({
          name: acc.name,
          type: acc.type,
          initialBalance: acc.initialBalance,
          isActive: acc.isActive,  
        });

        if (acc.currentBalance !== acc.initialBalance) {
          this.disableInitialBalance = true;
          this.form.get('initialBalance')?.disable();
        }

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  submit() {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();

    // 🔥 se não mudou o nome, não enviar name para evitar UNIQUE error
    if (this.isEdit && payload.name === this.originalName) {
      delete payload.name;
    }

    // 🔥 garantir que SEMPRE enviamos isActive
    if (!('isActive' in payload) || payload.isActive === undefined) {
      payload.isActive = true;
    }

    this.loading = true;

    if (this.isEdit) {
      this.accountsService.update(Number(this.accountId), payload).subscribe(() => {
        this.router.navigate(['/accounts']);
      });
    } else {
      this.accountsService.create(payload).subscribe(() => {
        this.router.navigate(['/accounts']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }
}
