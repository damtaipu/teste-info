import { Type, inputBinding } from '@angular/core';
import * as ngCore from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { VehiclesTableComponent } from './vehicles-table.component';

type ComponentInputs = Record<string, unknown>;

const SIGNAL = (ngCore as Record<string, unknown>)['\u0275SIGNAL'] as symbol | undefined;

function applyInput(instance: Record<string, unknown>, name: string, value: unknown): void {
  const maybeSignal = instance[name];

  if (typeof maybeSignal === 'function' && SIGNAL) {
    const node = (maybeSignal as unknown as Record<symbol, unknown>)[SIGNAL] as {
      applyValueToInputSignal?: (node: unknown, value: unknown) => void;
    };

    if (typeof node?.applyValueToInputSignal === 'function') {
      node.applyValueToInputSignal(node, value);
      return;
    }
  }

  instance[name] = value;
}

function createComponentWithInputs<T>(
  component: Type<T>,
  options: { inputs?: ComponentInputs } = {},
): ComponentFixture<T> {
  const inputs = options.inputs ?? {};

  try {
    const bindings = Object.entries(inputs).map(([name, value]) => inputBinding(name, () => value));

    const fixture = TestBed.createComponent(component, { bindings });
    fixture.detectChanges();
    return fixture;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('does not have an input with a public name')) {
      throw error;
    }

    const fixture = TestBed.createComponent(component);
    const instance = fixture.componentInstance as Record<string, unknown>;

    for (const [name, value] of Object.entries(inputs)) {
      applyInput(instance, name, value);
    }

    fixture.detectChanges();
    return fixture;
  }
}

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

  const setup = (overrides?: { vehicles?: Vehicle[]; loading?: boolean; busy?: boolean }) => {
    fixture?.destroy();

    fixture = createComponentWithInputs(VehiclesTableComponent, {
      inputs: {
        vehicles: overrides?.vehicles ?? [],
        loading: overrides?.loading ?? false,
        busy: overrides?.busy ?? false,
      },
    });

    component = fixture.componentInstance;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesTableComponent],
    }).compileComponents();

    setup();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir estado de carregamento', () => {
    setup({ loading: true });

    const state = fixture.nativeElement.querySelector('.state') as HTMLElement;
    expect(state.textContent).toContain('Carregando veiculos');
  });

  it('deve exibir estado vazio quando sem registros', () => {
    setup({ loading: false, vehicles: [] });

    const state = fixture.nativeElement.querySelector('.state') as HTMLElement;
    expect(state.textContent).toContain('Nenhum veiculo encontrado');
  });

  it('deve renderizar linhas e emitir edit/remove', () => {
    setup({ vehicles });

    const editSpy = vi.spyOn(component.edit, 'emit');
    const removeSpy = vi.spyOn(component.remove, 'emit');

    const editButton = fixture.nativeElement.querySelector('button.edit') as HTMLButtonElement;
    const removeButton = fixture.nativeElement.querySelector('button.remove') as HTMLButtonElement;

    editButton.click();
    removeButton.click();

    expect(editSpy).toHaveBeenCalledWith(vehicles[0]);
    expect(removeSpy).toHaveBeenCalledWith(vehicles[0]);
  });

  it('deve desabilitar botao de exclusao quando busy for true', () => {
    setup({ vehicles, busy: true });

    const removeButton = fixture.nativeElement.querySelector('button.remove') as HTMLButtonElement;

    expect(removeButton.disabled).toBe(true);
  });
});
