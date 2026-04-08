import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { VehiclesTableComponent } from './vehicles-table.component';

describe('VehiclesTableComponent', () => {
  let fixture: ComponentFixture<VehiclesTableComponent>;
  let component: VehiclesTableComponent;

  const vehicles: Vehicle[] = [
    {
      id: '1',
      placa: 'ABC1D23',
      chassi: '9BWZZZ377VT004251',
      renavam: '12345678901',
      modelo: 'Civic',
      marca: 'Honda',
      ano: 2023,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('vehicles', []);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir estado de carregamento', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const state = fixture.nativeElement.querySelector('.state') as HTMLElement;
    expect(state.textContent).toContain('Carregando veiculos');
  });

  it('deve exibir estado vazio quando sem registros', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('vehicles', []);
    fixture.detectChanges();

    const state = fixture.nativeElement.querySelector('.state') as HTMLElement;
    expect(state.textContent).toContain('Nenhum veiculo encontrado');
  });

  it('deve renderizar linhas e emitir edit/remove', () => {
    const editSpy = vi.spyOn(component.edit, 'emit');
    const removeSpy = vi.spyOn(component.remove, 'emit');

    fixture.componentRef.setInput('vehicles', vehicles);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector(
      'button.edit'
    ) as HTMLButtonElement;
    const removeButton = fixture.nativeElement.querySelector(
      'button.remove'
    ) as HTMLButtonElement;

    editButton.click();
    removeButton.click();

    expect(editSpy).toHaveBeenCalledWith(vehicles[0]);
    expect(removeSpy).toHaveBeenCalledWith(vehicles[0]);
  });

  it('deve desabilitar botao de exclusao quando busy for true', () => {
    fixture.componentRef.setInput('vehicles', vehicles);
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector(
      'button.remove'
    ) as HTMLButtonElement;

    expect(removeButton.disabled).toBe(true);
  });
});