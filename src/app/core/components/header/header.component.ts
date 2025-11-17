import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/AuthService.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  avatarUrl: string | null = null;
  profileMenuOpen = false;
  profileName: string | null = null;
  private _docClickListener: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
    this._docClickListener = () => (this.profileMenuOpen = false);
    document.addEventListener('click', this._docClickListener);
  }

  ngOnDestroy(): void {
    if (this._docClickListener) document.removeEventListener('click', this._docClickListener);
  }

  get visible(): boolean {
    const url = this.router?.url || '';
    if (!url) return true;
    const path = url.split('?')[0].split('#')[0];
    return !(path === '/login' || path.startsWith('/login') || path === '/register' || path.startsWith('/register'));
  }

  private loadProfile() {
    const blackSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="%23000"/></svg>';
    this.avatarUrl = blackSvg;
    try {
      this.authService.getProfile().subscribe({
        next: (u: any) => {
          const a = u?.avatar;
          if (a && typeof a === 'string' && a.length) this.avatarUrl = a;
          const n = u?.name;
          this.profileName = n && typeof n === 'string' ? n : null;
        },
        error: () => {
          // ignore
        },
      });
    } catch (e) {
      // ignore
    }
  }

  toggleProfileMenu(e: Event) {
    e.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  onChangeAvatar() {
    this.profileMenuOpen = false;
    const url = window.prompt('Cole a URL da nova imagem de avatar:');
    if (url === null) return;
    const trimmed = String(url).trim();
    if (!trimmed) return alert('URL inválida.');
    this.authService.updateProfile({ avatar: trimmed }).subscribe({
      next: () => (this.avatarUrl = trimmed),
      error: () => alert('Falha ao atualizar avatar.'),
    });
  }

  onChangeName() {
    this.profileMenuOpen = false;
    const name = window.prompt('Digite o novo nome do usuário:');
    if (name === null) return;
    const trimmed = String(name).trim();
    if (!trimmed) return alert('Nome inválido.');
    this.authService.updateProfile({ name: trimmed }).subscribe({
      next: () => {
        this.loadProfile();
        alert('Nome atualizado com sucesso.');
      },
      error: () => alert('Falha ao atualizar nome.'),
    });
  }

  onLogout() {
    try {
      this.authService.logout();
    } catch (e) {
      console.warn('Falha no logout', e);
    }
    this.router.navigate(['/login']);
  }
}
