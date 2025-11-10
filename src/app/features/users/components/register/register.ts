
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/AuthService.service';
import { User } from '../../../../shared/models/User.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = null;

    if (!this.name || this.name.trim().length < 3) {
      this.error = 'O nome é obrigatório e deve ter pelo menos 3 caracteres.';
      return;
    }

    if (!this.email) {
      this.error = 'O email é obrigatório.';
      return;
    }

    if (!this.password || this.password.length < 4 || this.password.length > 20) {
      this.error = 'A senha deve ter entre 4 e 20 caracteres.';
      return;
    }

    // Validar força da senha: deve conter letras maiúsculas, minúsculas e números/caracteres especiais
    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (!passwordRegex.test(this.password)) {
      this.error = 'A senha deve conter letras maiúsculas, minúsculas e números ou caracteres especiais.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'As senhas não coincidem.';
      return;
    }

    this.loading = true;

    const payload: User = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        // after successful registration, redirect to login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Erro ao registrar usuário.';
      },
    });
  }
}
