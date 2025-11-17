import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService, CategoryDto } from './categories.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-category-form',
  template: `
    <form (ngSubmit)="submit()" #f="ngForm" class="cat-form">
      <div>
        <label>Nome</label>
        <input name="name" [(ngModel)]="localModel.name" required minlength="3" maxlength="50" />
      </div>
      <div>
        <label>Tipo</label>
        <select name="type" [(ngModel)]="localModel.type" required>
          <option value="">Selecione</option>
          <option value="Receita">Receita</option>
          <option value="Despesa">Despesa</option>
        </select>
      </div>
      <div class="actions">
        <button type="submit" [disabled]="submitting">Salvar</button>
        <button type="button" (click)="cancel()">Cancelar</button>
      </div>
      <div class="errors" *ngIf="error">{{ error }}</div>
    </form>
  `,
  styleUrls: ['./category-form.component.scss'],
})
export class CategoryFormComponent implements OnChanges {
  @Input() model: CategoryDto | null = { name: '', type: 'Despesa' } as any;
  @Input() existing: CategoryDto[] = [];
  @Output() saved = new EventEmitter<CategoryDto>();
  @Output() cancelled = new EventEmitter<void>();

  localModel: CategoryDto = { name: '', type: 'Despesa' } as any;

  submitting = false;
  error: string | null = null;

  constructor(private svc: CategoriesService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['model']) {
      this.localModel = this.model ? { ...this.model } : { name: '', type: 'Despesa' } as any;
    }
  }

  validate(): string | null {
    const m = this.localModel || ({} as CategoryDto);
    if (!m.name || m.name.trim().length < 3) return 'Nome obrigatório (3-50 caracteres)';
    if (m.name.trim().length > 50) return 'Nome deve ter no máximo 50 caracteres';
    if (!m.type) return 'Tipo obrigatório';
    const dup = this.existing.find((c) => c.name.toLowerCase() === m.name.trim().toLowerCase() && c.id !== m.id);
    if (dup) return 'Já existe uma categoria com esse nome';
    return null;
  }

  submit() {
    this.error = this.validate();
    if (this.error) return;
    this.submitting = true;
    const m = this.localModel;
    const payload = { name: m.name.trim(), type: m.type };
    const req = m.id ? this.svc.update(m.id, payload) : this.svc.create(payload);
    req.subscribe({
      next: (res) => {
        this.submitting = false;
        this.saved.emit(res as CategoryDto);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Erro ao salvar categoria';
      },
    });
  }

  cancel() {
    this.cancelled.emit();
  }
}
