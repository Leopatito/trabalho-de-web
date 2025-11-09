import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../../shared/models/User.models';
import { AuthService } from '../../../../core/services/AuthService.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  email = '';
  password = '';
  remember = false;
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Preencha email e senha.';
      return;
    }

    this.error = null;
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        // prefer token from response, otherwise read stored token from AuthService side-effect
        const token = res?.access_token ?? localStorage.getItem('token');
        if (token) {
          if (this.remember) {
            localStorage.setItem('token', token);
          } else {
            sessionStorage.setItem('token', token);
          }
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Resposta inválida do servidor.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Erro ao autenticar.';
      },
    });
  }
}
