import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourtService } from '../../core/services/court.service';
import { Court } from '../../core/models/court.model';

@Component({
  selector: 'app-courts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './courts.component.html',
  styleUrl: './courts.component.scss'
})
export class CourtsComponent implements OnInit {
  courts: Court[] = [];
  loading = true;
  showForm = false;
  editingCourt: Court | null = null;
  saving = false;
  error = '';
  successMsg = '';

  form = { name: '', address: '', city: '', notes: '' };

  constructor(private courtService: CourtService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.courtService.getAll().subscribe({
      next: courts => { this.courts = courts; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate() {
    this.editingCourt = null;
    this.form = { name: '', address: '', city: '', notes: '' };
    this.showForm = true;
    this.error = '';
  }

  openEdit(court: Court) {
    this.editingCourt = court;
    this.form = { name: court.name, address: court.address ?? '', city: court.city ?? '', notes: court.notes ?? '' };
    this.showForm = true;
    this.error = '';
  }

  cancelForm() {
    this.showForm = false;
    this.editingCourt = null;
    this.error = '';
  }

  save() {
    if (!this.form.name.trim()) { this.error = 'O nome da quadra é obrigatório.'; return; }
    this.saving = true;
    this.error = '';
    const dto = { name: this.form.name.trim(), address: this.form.address || undefined, city: this.form.city || undefined, notes: this.form.notes || undefined };

    const req$ = this.editingCourt
      ? this.courtService.update(this.editingCourt.id, dto)
      : this.courtService.create(dto);

    req$.subscribe({
      next: () => {
        this.successMsg = this.editingCourt ? 'Quadra atualizada!' : 'Quadra cadastrada!';
        this.saving = false;
        this.showForm = false;
        this.editingCourt = null;
        this.load();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao salvar quadra.';
        this.saving = false;
      }
    });
  }

  toggle(court: Court) {
    this.courtService.toggle(court.id).subscribe({
      next: () => this.load(),
      error: err => alert(err.error?.message || 'Erro ao alterar status.')
    });
  }
}
