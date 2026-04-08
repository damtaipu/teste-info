import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Vehicle, VehiclePayload } from '../../../core/models/vehicle.model';
import { VehicleFormComponent } from '../components/vehicle-form/vehicle-form.component';
import { VehiclesTableComponent } from '../components/vehicles-table/vehicles-table.component';
import { VehiclesStore } from '../state/vehicles.store';

@Component({
  selector: 'app-vehicles-page',
  standalone: true,
  imports: [CommonModule, FormsModule, VehicleFormComponent, VehiclesTableComponent],
  templateUrl: './vehicles-page.component.html',
  styleUrl: './vehicles-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesPageComponent implements OnInit {
  protected readonly store = inject(VehiclesStore);

  private readonly editingId = signal<string | null>(null);

  protected readonly editingVehicle = computed<Vehicle | null>(() => {
    const id = this.editingId();

    if (!id) {
      return null;
    }

    return this.store.vehicles().find((item) => item.id === id) ?? null;
  });

  ngOnInit(): void {
    void this.store.load();
  }

  protected onEdit(vehicle: Vehicle): void {
    this.editingId.set(vehicle.id);
  }

  protected onCancelEdit(): void {
    this.editingId.set(null);
  }

  protected async onSave(payload: VehiclePayload): Promise<void> {
    const id = this.editingId();

    if (id) {
      await this.store.update(id, payload);
      this.editingId.set(null);
      return;
    }

    await this.store.create(payload);
  }

  protected async onRemove(vehicle: Vehicle): Promise<void> {
    const confirmed = window.confirm(
      `Confirma a exclusao do veiculo ${vehicle.placa} (${vehicle.modelo})?`
    );

    if (!confirmed) {
      return;
    }

    await this.store.remove(vehicle.id);

    if (this.editingId() === vehicle.id) {
      this.editingId.set(null);
    }
  }
}