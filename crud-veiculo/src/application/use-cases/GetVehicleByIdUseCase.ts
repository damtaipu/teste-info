import type { VehicleRecord } from "../../domain/entities/Vehicle";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";
import type { VehicleRepository } from "../ports/VehicleRepository";

export class GetVehicleByIdUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(id: string): Promise<VehicleRecord> {
    if (!id) {
      throw new ValidationError("O parametro 'id' e obrigatorio.");
    }

    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError("Veiculo nao encontrado.");
    }

    return vehicle;
  }
}