import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { VehiclesRepositoryPort } from '../../../core/ports/vehicles-repository.port';
import { Vehicle, VehiclePayload } from '../../../core/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehiclesStore {
  private readonly repository = inject(VehiclesRepositoryPort);

  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _search = signal('');
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly vehicles = this._vehicles.asReadonly();
  readonly search = this._search.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filteredVehicles = computed(() => {
    const value = this._search().trim().toLowerCase();

    if (!value) {
      return this._vehicles();
    }

    return this._vehicles().filter((vehicle) =>
      [vehicle.placa, vehicle.chassi, vehicle.renavam, vehicle.modelo, vehicle.marca]
        .join(' ')
        .toLowerCase()
        .includes(value)
    );
  });

  readonly total = computed(() => this._vehicles().length);

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const data = await firstValueFrom(this.repository.list());
      this._vehicles.set(data);
    } catch (error) {
      this._error.set(this.resolveError(error));
    } finally {
      this._loading.set(false);
    }
  }

  setSearch(value: string): void {
    this._search.set(value);
  }

  async create(payload: VehiclePayload): Promise<void> {
    this._saving.set(true);
    this._error.set(null);

    try {
      const created = await firstValueFrom(this.repository.create(payload));
      this._vehicles.update((items) => [created, ...items]);
    } catch (error) {
      this._error.set(this.resolveError(error));
      throw error;
    } finally {
      this._saving.set(false);
    }
  }

  async update(id: string, payload: VehiclePayload): Promise<void> {
    this._saving.set(true);
    this._error.set(null);

    try {
      const updated = await firstValueFrom(this.repository.update(id, payload));
      this._vehicles.update((items) =>
        items.map((item) => (item.id === id ? updated : item))
      );
    } catch (error) {
      this._error.set(this.resolveError(error));
      throw error;
    } finally {
      this._saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    this._saving.set(true);
    this._error.set(null);

    try {
      await firstValueFrom(this.repository.delete(id));
      this._vehicles.update((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      this._error.set(this.resolveError(error));
      throw error;
    } finally {
      this._saving.set(false);
    }
  }

  private resolveError(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Ocorreu um erro inesperado.';
  }
}