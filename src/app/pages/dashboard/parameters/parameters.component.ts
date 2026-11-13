import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ParameterService } from '../../../services/parameter.service';
import { Parameter } from '../../../core/models/parameter.model';

/** Tarjeta "Parámetros": lista la tabla parameters y permite editar el valor (solo ADMIN en el backend). */
@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.css']
})
export class ParametersComponent implements OnInit {
  parameters: Parameter[] = [];
  loading = false;
  loadError = '';

  editingId: number | null = null;
  draft = 0;
  saving = false;
  rowError = '';
  savedId: number | null = null;

  constructor(private parameterService: ParameterService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = '';
    this.parameterService.getAll().subscribe({
      next: res => { this.loading = false; this.parameters = res.data ?? []; },
      error: () => { this.loading = false; this.loadError = 'No se pudieron cargar los parámetros.'; }
    });
  }

  startEdit(parameter: Parameter): void {
    this.editingId = parameter.id;
    this.draft = parameter.value;
    this.rowError = '';
    this.savedId = null;
  }

  cancel(): void {
    this.editingId = null;
    this.rowError = '';
  }

  save(parameter: Parameter): void {
    const value = this.draft;
    if (!value) {
      this.rowError = 'El valor no puede estar vacío.';
      return;
    }
    if (+value < 1  || +value >= 10 ) {
      this.rowError = 'El valor debe estar entre 1 a 10.';
      return;
    }
    this.saving = true;
    this.rowError = '';
    this.parameterService.updateValue(parameter.id, value.toString()).subscribe({
      next: res => {
        this.saving = false;
        this.parameters = this.parameters.map(p => (p.id === parameter.id ? res.data : p));
        this.editingId = null;
        this.savedId = parameter.id;
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.rowError = err.status === 403
          ? 'Solo un administrador puede editar parámetros.'
          : (err.error?.message || 'No se pudo guardar el valor.');
      }
    });
  }
}
