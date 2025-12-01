import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService, UserProfile } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  isCollapsed = true;
  loading = false;
  error = '';
  successMessage = '';

  userName = '';
  userAvatar = '';

  formData: Partial<UserProfile> = {
    name: '',
    email: '',
    avatar: '',
    currency: 'BRL'
  };

  editOptions = {
    name: false,
    avatar: false,
    currency: false
  };

  private originalData: Partial<UserProfile> = {};

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.userService.getMe().subscribe({
      next: (user) => {
        this.formData = { ...user };
        this.originalData = { ...user };
        this.userName = user.name;
        this.userAvatar = user.avatar || '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil', err);
        this.error = 'Erro ao carregar perfil do usuário';
        this.loading = false;
      }
    });
  }

  saveChanges(): void {
    if (!this.formData.name || this.formData.name.trim().length < 3) {
      this.error = 'O nome é obrigatório e deve ter pelo menos 3 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.userService.update({
      name: this.formData.name?.trim(),
      avatar: this.formData.avatar?.trim() || undefined,
      currency: this.formData.currency
    }).subscribe({
      next: (user) => {
        this.formData = { ...user };
        this.originalData = { ...user };
        this.userName = user.name;
        this.userAvatar = user.avatar || '';
        this.successMessage = 'Perfil atualizado com sucesso!';
        this.loading = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil', err);
        this.error = 'Erro ao atualizar perfil. Tente novamente.';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.formData = { ...this.originalData };
    this.error = '';
    this.successMessage = '';
  }

  get hasChanges(): boolean {
    return JSON.stringify(this.formData) !== JSON.stringify(this.originalData);
  }

  getOriginalData(): Partial<UserProfile> {
    return this.originalData;
  }

  getDefaultAvatar(): string {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"><rect width="150" height="150" fill="%23000000"/><circle cx="75" cy="50" r="25" fill="%23ffffff"/><path d="M 30 110 Q 30 90 75 90 Q 120 90 120 110 L 120 150 L 30 150 Z" fill="%23ffffff"/></svg>';
  }

  saveNameOnly(): void {
    if (!this.formData.name || this.formData.name.trim().length < 3) {
      this.error = 'O nome é obrigatório e deve ter pelo menos 3 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.userService.update({
      name: this.formData.name.trim(),
      avatar: this.originalData.avatar,
      currency: this.originalData.currency
    }).subscribe({
      next: (user) => {
        this.originalData = { ...user };
        this.userName = user.name;
        this.userAvatar = user.avatar || '';
        this.successMessage = 'Nome atualizado com sucesso!';
        this.loading = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Erro ao atualizar nome', err);
        this.error = 'Erro ao atualizar nome. Tente novamente.';
        this.loading = false;
      }
    });
  }

  saveAvatarOnly(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.userService.update({
      name: this.originalData.name,
      avatar: this.formData.avatar?.trim() || undefined,
      currency: this.originalData.currency
    }).subscribe({
      next: (user) => {
        this.originalData = { ...user };
        this.userAvatar = user.avatar || '';
        this.successMessage = 'Avatar atualizado com sucesso!';
        this.loading = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Erro ao atualizar avatar', err);
        this.error = 'Erro ao atualizar avatar. Tente novamente.';
        this.loading = false;
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  onLogout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
