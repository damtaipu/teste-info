import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle, VehiclePayload } from '../../../../core/models/vehicle.model';

interface VehicleForm {
  placa: FormControl<string>;
  chassi: FormControl<string>;
  renavam: FormControl<string>;
  modelo: FormControl<string>;
  marca: FormControl<string>;
  ano: FormControl<number | null>;
}

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleFormComponent {
  readonly vehicle = input<Vehicle | null>(null);
  readonly busy = input(false);

  readonly save = output<VehiclePayload>();
  readonly cancel = output<void>();

  readonly form = new FormGroup<VehicleForm>({
    placa: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    chassi: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    renavam: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    modelo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    marca: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    ano: new FormControl<number | null>(null, [Validators.required, Validators.min(1886)]),
  });

  readonly formTitle = computed(() => (this.vehicle() ? 'Editar Veiculo' : 'Novo Veiculo'));

  readonly formSubtitle = computed(() =>
    this.vehicle()
      ? 'Atualize os dados do veículo selecionado.'
      : 'Preencha os dados para cadastrar um novo veículo.',
  );

  readonly submitLabel = computed(() =>
    this.vehicle() ? 'Salvar alterações' : 'Cadastrar veículo',
  );

  constructor() {
    effect(() => {
      const current = this.vehicle();

      if (current) {
        this.form.setValue({
          placa: current.placa,
          chassi: current.chassi,
          renavam: current.renavam,
          modelo: current.modelo,
          marca: current.marca,
          ano: current.ano,
        });
      } else {
        this.form.reset({
          placa: '',
          chassi: '',
          renavam: '',
          modelo: '',
          marca: '',
          ano: null,
        });
      }
    });
  }

  invalid(controlName: keyof VehicleForm): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.save.emit({
      placa: raw.placa.trim(),
      chassi: raw.chassi.trim(),
      renavam: raw.renavam.trim(),
      modelo: raw.modelo.trim(),
      marca: raw.marca.trim(),
      ano: Number(raw.ano),
    });
  }
}
