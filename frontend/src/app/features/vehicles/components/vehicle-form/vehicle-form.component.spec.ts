import { Type, inputBinding } from '@angular/core';
import * as ngCore from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { VehicleFormComponent } from './vehicle-form.component';

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

  const setup = (overrides?: { vehicle?: Vehicle | null; busy?: boolean }) => {
    fixture?.destroy();

    fixture = createComponentWithInputs(VehicleFormComponent, {
      inputs: {
        vehicle: overrides?.vehicle ?? null,
        busy: overrides?.busy ?? false,
      },
    });

    component = fixture.componentInstance;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleFormComponent],
    }).compileComponents();

    setup();
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
    setup({ vehicle });

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
    setup({ vehicle });

    const cancelSpy = vi.spyOn(component.cancel, 'emit');

    const cancelButton = fixture.nativeElement.querySelector(
      'button.secondary',
    ) as HTMLButtonElement;

    cancelButton.click();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
