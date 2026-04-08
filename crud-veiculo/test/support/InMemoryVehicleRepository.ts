import {
  VehicleRepository,
  type UniqueVehicleFields,
} from "../../src/application/ports/VehicleRepository";
import type {
  VehicleRecord,
  VehicleWithoutId,
} from "../../src/domain/entities/Vehicle";

export class InMemoryVehicleRepository extends VehicleRepository {
  private items: VehicleRecord[] = [];
  private sequence = 1;

  public async findAll(): Promise<VehicleRecord[]> {
    return [...this.items];
  }

  public async findById(id: string): Promise<VehicleRecord | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  public async existsByUniqueFields(
    vehicleData: UniqueVehicleFields,
    ignoreId: string | null = null
  ): Promise<boolean> {
    return this.items.some((item) => {
      if (ignoreId && item.id === ignoreId) {
        return false;
      }

      return (
        item.placa === vehicleData.placa ||
        item.chassi === vehicleData.chassi ||
        item.renavam === vehicleData.renavam
      );
    });
  }

  public async create(vehicleData: VehicleWithoutId): Promise<VehicleRecord> {
    const created: VehicleRecord = {
      id: String(this.sequence++),
      ...vehicleData,
    };

    this.items.push(created);
    return created;
  }

  public async update(
    id: string,
    vehicleData: VehicleWithoutId
  ): Promise<VehicleRecord | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    this.items[index] = { ...this.items[index], ...vehicleData, id };
    return this.items[index];
  }

  public async delete(id: string): Promise<boolean> {
    const oldSize = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < oldSize;
  }
}
