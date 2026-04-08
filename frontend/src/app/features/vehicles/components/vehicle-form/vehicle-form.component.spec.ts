import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { VehicleFormComponent } from './vehicle-form.component';
import { Vehicle } from '../../../../core/models/vehicle.model';

describe('VehicleFormComponent', () => {
  let fixture: ComponentFixture<VehicleFormComponent>;
  let component: VehicleFormComponent;

  const vehicle: Vehicle = {
    id: '1',
    placa: 'ABC1D23',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678901',
    modelo: 'Civic',
    marca: 'Honda',
    ano: 2023,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar em modo cadastro', () => {
    const title = fixture.nativeElement.querySelector('h2') as HTMLElement;
    const cancelButton = fixture.nativeElement.querySelector('button.secondary');

    expect(title.textContent).toContain('Novo Veiculo');
    expect(cancelButton).toBeNull();
  });

  it('deve entrar em modo edicao quando receber vehicle', () => {
    fixture.componentRef.setInput('vehicle', vehicle);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h2') as HTMLElement;

    expect(title.textContent).toContain('Editar Veiculo');
    expect(component.form.getRawValue().placa).toBe(vehicle.placa);
    expect(component.form.getRawValue().modelo).toBe(vehicle.modelo);
  });

  it('nao deve emitir save quando formulario invalido', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.onSubmit();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(component.form.controls.placa.touched).toBe(true);
  });

  it('deve emitir payload normalizado quando formulario for valido', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.form.setValue({
      placa: ' abc1d23 ',
      chassi: ' 9BWZZZ377VT004251 ',
      renavam: ' 12345678901 ',
      modelo: ' Civic ',
      marca: ' Honda ',
      ano: 2023,
    });

    component.onSubmit();

    expect(saveSpy).toHaveBeenCalledWith({
      placa: 'abc1d23',
      chassi: '9BWZZZ377VT004251',
      renavam: '12345678901',
      modelo: 'Civic',
      marca: 'Honda',
      ano: 2023,
    });
  });

  it('deve emitir cancel ao clicar em cancelar edicao', () => {
    const cancelSpy = vi.spyOn(component.cancel, 'emit');

    fixture.componentRef.setInput('vehicle', vehicle);
    fixture.detectChanges();

    const cancelButton = fixture.nativeElement.querySelector(
      'button.secondary'
    ) as HTMLButtonElement;

    cancelButton.click();

    expect(cancelSpy).toHaveBeenCalled();
  });
});