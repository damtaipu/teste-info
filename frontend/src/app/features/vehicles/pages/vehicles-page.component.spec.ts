import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Vehicle, VehiclePayload } from '../../../core/models/vehicle.model';
import { VehicleFormComponent } from '../components/vehicle-form/vehicle-form.component';
import { VehiclesTableComponent } from '../components/vehicles-table/vehicles-table.component';
import { VehiclesStore } from '../state/vehicles.store';
import { VehiclesPageComponent } from './vehicles-page.component';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  template: '',
})
class VehicleFormStubComponent {
  @Input() vehicle: Vehicle | null = null;
  @Input() busy = false;

  @Output() readonly save = new EventEmitter<VehiclePayload>();
  @Output() readonly cancel = new EventEmitter<void>();
}

@Component({
  selector: 'app-vehicles-table',
  standalone: true,
  template: '',
})
class VehiclesTableStubComponent {
  @Input() vehicles: Vehicle[] = [];
  @Input() loading = false;
  @Input() busy = false;

  @Output() readonly edit = new EventEmitter<Vehicle>();
  @Output() readonly remove = new EventEmitter<Vehicle>();
}

describe('VehiclesPageComponent', () => {
  let fixture: ComponentFixture<VehiclesPageComponent>;
  let component: VehiclesPageComponent;

  const vehicle: Vehicle = {
    id: '1',
    placa: 'ABC1D23',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678901',
    modelo: 'Civic',
    marca: 'Honda',
    ano: 2023,
  };

  const storeMock = {
    vehicles: signal<Vehicle[]>([vehicle]),
    search: signal(''),
    loading: signal(false),
    saving: signal(false),
    error: signal<string | null>(null),
    filteredVehicles: signal<Vehicle[]>([vehicle]),
    total: signal(1),
    load: vi.fn().mockResolvedValue(undefined),
    setSearch: vi.fn(),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesPageComponent],
      providers: [{ provide: VehiclesStore, useValue: storeMock }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(VehiclesPageComponent, {
        remove: {
          imports: [VehicleFormComponent, VehiclesTableComponent],
        },
        add: {
          imports: [VehicleFormStubComponent, VehiclesTableStubComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VehiclesPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    storeMock.load.mockClear();
    storeMock.create.mockClear();
    storeMock.update.mockClear();
    storeMock.remove.mockClear();
  });

  it('deve criar o componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve carregar dados no ngOnInit', () => {
    fixture.detectChanges();

    expect(storeMock.load).toHaveBeenCalledTimes(1);
  });

  it('deve chamar create quando salvar sem item em edicao', async () => {
    fixture.detectChanges();

    await (component as any).onSave({
      placa: 'ZZZ9Z99',
      chassi: 'X',
      renavam: 'Y',
      modelo: 'M',
      marca: 'B',
      ano: 2024,
    });

    expect(storeMock.create).toHaveBeenCalledTimes(1);
    expect(storeMock.update).not.toHaveBeenCalled();
  });

  it('deve chamar update quando houver item em edicao', async () => {
    fixture.detectChanges();

    (component as any).onEdit(vehicle);

    await (component as any).onSave({
      placa: vehicle.placa,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      modelo: 'Atualizado',
      marca: vehicle.marca,
      ano: vehicle.ano,
    });

    expect(storeMock.update).toHaveBeenCalledWith(vehicle.id, {
      placa: vehicle.placa,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      modelo: 'Atualizado',
      marca: vehicle.marca,
      ano: vehicle.ano,
    });
    expect((component as any).editingVehicle()).toBeNull();
  });

  it('nao deve remover quando usuario cancelar confirmacao', async () => {
    fixture.detectChanges();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await (component as any).onRemove(vehicle);

    expect(storeMock.remove).not.toHaveBeenCalled();
  });

  it('deve remover e limpar edicao quando confirmado', async () => {
    fixture.detectChanges();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    (component as any).onEdit(vehicle);
    await (component as any).onRemove(vehicle);

    expect(storeMock.remove).toHaveBeenCalledWith(vehicle.id);
    expect((component as any).editingVehicle()).toBeNull();
  });
});
