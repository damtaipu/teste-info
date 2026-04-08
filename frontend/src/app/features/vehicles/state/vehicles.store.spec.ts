import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Vehicle, VehiclePayload } from '../../../core/models/vehicle.model';
import { VehiclesRepositoryPort } from '../../../core/ports/vehicles-repository.port';
import { VehiclesStore } from './vehicles.store';

describe('VehiclesStore', () => {
  let store: VehiclesStore;

  const repositoryMock = {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const payload: VehiclePayload = {
    placa: 'ABC1D23',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678901',
    modelo: 'Civic',
    marca: 'Honda',
    ano: 2023,
  };

  const vehicle: Vehicle = { id: '1', ...payload };

  beforeEach(() => {
    repositoryMock.list.mockReset();
    repositoryMock.create.mockReset();
    repositoryMock.update.mockReset();
    repositoryMock.delete.mockReset();

    TestBed.configureTestingModule({
      providers: [
        VehiclesStore,
        { provide: VehiclesRepositoryPort, useValue: repositoryMock },
      ],
    });

    store = TestBed.inject(VehiclesStore);
  });

  it('deve carregar lista com sucesso', async () => {
    repositoryMock.list.mockReturnValue(of([vehicle]));

    await store.load();

    expect(store.vehicles()).toEqual([vehicle]);
    expect(store.total()).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('deve tratar erro ao carregar lista', async () => {
    repositoryMock.list.mockReturnValue(throwError(() => new Error('erro load')));

    await store.load();

    expect(store.error()).toBe('erro load');
    expect(store.loading()).toBe(false);
  });

  it('deve filtrar por busca', async () => {
    repositoryMock.list.mockReturnValue(
      of([
        vehicle,
        {
          id: '2',
          placa: 'ZZZ1Z11',
          chassi: '9BWZZZ377VT004299',
          renavam: '98765432100',
          modelo: 'Corolla',
          marca: 'Toyota',
          ano: 2021,
        },
      ])
    );

    await store.load();
    store.setSearch('corolla');

    expect(store.filteredVehicles().length).toBe(1);
    expect(store.filteredVehicles()[0].modelo).toBe('Corolla');
  });

  it('deve criar veiculo com sucesso', async () => {
    repositoryMock.create.mockReturnValue(of(vehicle));

    await store.create(payload);

    expect(store.vehicles()).toEqual([vehicle]);
    expect(store.saving()).toBe(false);
  });

  it('deve propagar erro ao criar', async () => {
    repositoryMock.create.mockReturnValue(throwError(() => new Error('erro create')));

    await expect(store.create(payload)).rejects.toThrow('erro create');
    expect(store.error()).toBe('erro create');
    expect(store.saving()).toBe(false);
  });

  it('deve atualizar veiculo com sucesso', async () => {
    repositoryMock.list.mockReturnValue(of([vehicle]));
    await store.load();

    const updated: Vehicle = { ...vehicle, modelo: 'Atualizado' };
    repositoryMock.update.mockReturnValue(of(updated));

    await store.update(vehicle.id, { ...payload, modelo: 'Atualizado' });

    expect(store.vehicles()[0].modelo).toBe('Atualizado');
    expect(store.saving()).toBe(false);
  });

  it('deve propagar erro ao atualizar', async () => {
    repositoryMock.update.mockReturnValue(throwError(() => new Error('erro update')));

    await expect(store.update(vehicle.id, payload)).rejects.toThrow('erro update');
    expect(store.error()).toBe('erro update');
    expect(store.saving()).toBe(false);
  });

  it('deve remover veiculo com sucesso', async () => {
    repositoryMock.list.mockReturnValue(of([vehicle]));
    await store.load();

    repositoryMock.delete.mockReturnValue(of(void 0));

    await store.remove(vehicle.id);

    expect(store.vehicles()).toEqual([]);
    expect(store.saving()).toBe(false);
  });

  it('deve propagar erro ao remover', async () => {
    repositoryMock.delete.mockReturnValue(throwError(() => new Error('erro remove')));

    await expect(store.remove(vehicle.id)).rejects.toThrow('erro remove');
    expect(store.error()).toBe('erro remove');
    expect(store.saving()).toBe(false);
  });
});