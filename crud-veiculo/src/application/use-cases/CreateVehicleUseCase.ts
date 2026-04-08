import type { VehicleInput, VehicleRecord } from "../../domain/entities/Vehicle";
import { Vehicle } from "../../domain/entities/Vehicle";
import { ConflictError } from "../../domain/errors/ConflictError";
import type { VehicleRepository } from "../ports/VehicleRepository";

export class CreateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(input: VehicleInput): Promise<VehicleRecord> {
    const vehicle = new Vehicle(input);
    const payload = vehicle.toData();

    const duplicated = await this.vehicleRepository.existsByUniqueFields(payload);
    if (duplicated) {
      throw new ConflictError(
        "Ja existe um veiculo com a mesma placa, chassi ou renavam."
      );
    }

    return this.vehicleRepository.create(payload);
  }
}