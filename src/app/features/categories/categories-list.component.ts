import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryFormComponent } from './category-form.component';
import { CategoriesService, CategoryDto } from './categories.service';

@Component({
  standalone: true,
  imports: [CommonModule, CategoryFormComponent],
  selector: 'app-categories-list',
  template: `
    <div class="categories-root">
      <h2>Gerenciar Categorias</h2>
      <div class="actions">
        <button (click)="newCategory()">Nova Categoria</button>
      </div>

      <div *ngIf="loading">Carregando...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngIf="editing">
        <h3>{{ editModel?.id ? 'Editar Categoria' : 'Criar Categoria' }}</h3>
        <app-category-form [model]="editModel" [existing]="categories" (saved)="onSaved($event)" (cancelled)="onCancel()"></app-category-form>
      </div>

      <ul class="list">
        <li *ngFor="let c of categories">
          <div class="meta">
            <strong>{{ c.name }}</strong>
            <span class="type">{{ c.type }}</span>
            <span *ngIf="c.isDefault" class="badge">Padrão</span>
          </div>
          <div class="ops">
            <button (click)="startEdit(c)" [disabled]="c.isDefault">Editar</button>
            <button (click)="remove(c)" [disabled]="c.isDefault">Excluir</button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./categories-list.component.scss'],
})
export class CategoriesListComponent implements OnInit {
  categories: CategoryDto[] = [];
  loading = false;
  error: string | null = null;

  editing = false;
  editModel: CategoryDto | null = null;

  constructor(private svc: CategoriesService) {}

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
