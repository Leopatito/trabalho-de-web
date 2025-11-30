import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoryFormComponent } from './category-form.component';
import { CategoriesService, CategoryDto } from './categories.service';

@Component({
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf, CategoryFormComponent, RouterModule],
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
})
export class CategoriesListComponent implements OnInit {
  // Sidebar
  isCollapsed: boolean = true;

  // Data
  categories: CategoryDto[] = [];
  loading = false;
  error: string | null = null;

  editing = false;
  editModel: CategoryDto | null = null;

  constructor(private svc: CategoriesService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.listAll().subscribe({
      next: (r) => {
        this.categories = r;
        this.loading = false;
      },
      error: (e) => {
        this.error = 'Falha ao carregar categorias';
        this.loading = false;
      },
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  newCategory() {
    this.editModel = { name: '', type: 'Despesa' } as CategoryDto;
    this.editing = true;
  }

  startEdit(c: CategoryDto) {
    this.editModel = { ...c };
    this.editing = true;
  }

  onSaved(_: CategoryDto) {
    this.editing = false;
    this.editModel = null;
    this.load();
  }

  onCancel() {
    this.editing = false;
    this.editModel = null;
  }

  remove(c: CategoryDto) {
    if (!confirm(`Excluir categoria "${c.name}"?`)) return;
    this.svc.remove(c.id!).subscribe({
      next: () => this.load(),
      error: (err) => {
        const msg = err?.error?.message || 'Falha ao excluir categoria. Verifique se há lançamentos vinculados.';
        alert(msg);
      },
    });
  }
}
