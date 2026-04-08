import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";
import type { VehicleRepository } from "../ports/VehicleRepository";

export class DeleteVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError("O parametro 'id' e obrigatorio.");
    }

    const deleted = await this.vehicleRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Veiculo nao encontrado.");
    }
  }
}