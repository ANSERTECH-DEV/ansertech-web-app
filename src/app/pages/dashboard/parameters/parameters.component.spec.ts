import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ParametersComponent } from './parameters.component';
import { ParameterService } from '../../../services/parameter.service';
import { Parameter } from '../../../core/models/parameter.model';

describe('ParametersComponent', () => {
  let fixture: ComponentFixture<ParametersComponent>;
  let component: ParametersComponent;
  let service: jasmine.SpyObj<ParameterService>;

  const emailCount: Parameter = {
    id: 1, name: 'Cantidad de correos', value: '2',
    description: 'Cantidad máxima de correos no leídos que consulta el polling manual.'
  };
  const ok = <T>(data: T) => of({ success: true, message: '', data });
  const text = (): string => fixture.nativeElement.textContent;

  beforeEach(() => {
    service = jasmine.createSpyObj('ParameterService', ['getAll', 'updateValue']);
    service.getAll.and.returnValue(ok([emailCount]));
    TestBed.configureTestingModule({
      declarations: [ParametersComponent],
      imports: [FormsModule],
      providers: [{ provide: ParameterService, useValue: service }]
    });
    fixture = TestBed.createComponent(ParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra nombre, descripción y valor de cada parámetro', () => {
    expect(service.getAll).toHaveBeenCalledTimes(1);
    expect(text()).toContain('Cantidad de correos');
    expect(text()).toContain('Cantidad máxima de correos no leídos');
    expect(fixture.nativeElement.querySelector('.pm-value').textContent).toContain('2');
  });

  it('guarda el nuevo valor y lo muestra en la tabla', () => {
    service.updateValue.and.returnValue(ok({ ...emailCount, value: '10' }));

    component.startEdit(emailCount);
    component.draft = ' 10 ';
    component.save(emailCount);
    fixture.detectChanges();

    expect(service.updateValue).toHaveBeenCalledWith(1, '10');
    expect(component.editingId).toBeNull();
    expect(fixture.nativeElement.querySelector('.pm-value').textContent).toContain('10');
    expect(text()).toContain('Guardado');
  });

  it('no envía un valor vacío', () => {
    component.startEdit(emailCount);
    component.draft = '   ';
    component.save(emailCount);
    fixture.detectChanges();

    expect(service.updateValue).not.toHaveBeenCalled();
    expect(text()).toContain('El valor no puede estar vacío');
  });

  it('muestra el error de validación del backend', () => {
    service.updateValue.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 400, error: { success: false, message: "'Cantidad de correos' debe ser un número entero entre 1 y 1000" }
    })));

    component.startEdit(emailCount);
    component.draft = '0';
    component.save(emailCount);
    fixture.detectChanges();

    expect(component.editingId).toBe(1);
    expect(text()).toContain('debe ser un número entero entre 1 y 1000');
  });

  it('avisa cuando el usuario no es administrador (403)', () => {
    service.updateValue.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));

    component.startEdit(emailCount);
    component.draft = '5';
    component.save(emailCount);
    fixture.detectChanges();

    expect(text()).toContain('Solo un administrador puede editar parámetros');
  });

  it('cancelar descarta el cambio', () => {
    component.startEdit(emailCount);
    component.draft = '99';
    component.cancel();
    fixture.detectChanges();

    expect(service.updateValue).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.pm-value').textContent).toContain('2');
  });
});
