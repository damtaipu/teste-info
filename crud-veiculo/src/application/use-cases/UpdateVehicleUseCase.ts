import type { VehicleInput, VehicleRecord } from "../../domain/entities/Vehicle";
import { Vehicle } from "../../domain/entities/Vehicle";
import { ConflictError } from "../../domain/errors/ConflictError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";
import type { VehicleRepository } from "../ports/VehicleRepository";

export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(
    id: string,
    input: Partial<Omit<VehicleInput, "id">>
  ): Promise<VehicleRecord> {
    if (!id) {
      throw new ValidationError("O parametro 'id' e obrigatorio.");
    }

    const existingVehicle = await this.vehicleRepository.findById(id);
    if (!existingVehicle) {
      throw new NotFoundError("Veiculo nao encontrado.");
    }

    const mergedData: VehicleInput = { ...existingVehicle, ...input, id };
    const vehicle = new Vehicle(mergedData);
    const payload = vehicle.toData();

    const duplicated = await this.vehicleRepository.existsByUniqueFields(payload, id);
    if (duplicated) {
      throw new ConflictError(
        "Ja existe um veiculo com a mesma placa, chassi ou renavam."
      );
    }

    const updated = await this.vehicleRepository.update(id, payload);
    if (!updated) {
      throw new NotFoundError("Veiculo nao encontrado.");
    }

    return updated;
  }
}