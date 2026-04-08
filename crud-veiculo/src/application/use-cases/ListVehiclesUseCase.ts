import type { VehicleRecord } from "../../domain/entities/Vehicle";
import type { VehicleRepository } from "../ports/VehicleRepository";

export class ListVehiclesUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(): Promise<VehicleRecord[]> {
    return this.vehicleRepository.findAll();
  }
}