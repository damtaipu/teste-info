import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Vehicle } from '../../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicles-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicles-table.component.html',
  styleUrl: './vehicles-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesTableComponent {
  readonly vehicles = input.required<Vehicle[]>();
  readonly loading = input(false);
  readonly busy = input(false);

  readonly edit = output<Vehicle>();
  readonly remove = output<Vehicle>();
}