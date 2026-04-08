import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  VehicleRepository,
  type UniqueVehicleFields,
} from "../../application/ports/VehicleRepository";
import type {
  VehicleRecord,
  VehicleWithoutId,
} from "../../domain/entities/Vehicle";

export class JsonVehicleRepository extends VehicleRepository {
  constructor(private readonly filePath: string) {
    super();
  }

  public async findAll(): Promise<VehicleRecord[]> {
    return this.read();
  }

  public async findById(id: string): Promise<VehicleRecord | null> {
    const vehicles = await this.read();
    return vehicles.find((vehicle) => vehicle.id === id) ?? null;
  }

  public async existsByUniqueFields(
    vehicleData: UniqueVehicleFields,
    ignoreId: string | null = null
  ): Promise<boolean> {
    const vehicles = await this.read();

    return vehicles.some((vehicle) => {
      if (ignoreId && vehicle.id === ignoreId) {
        return false;
      }

      return (
        vehicle.placa === vehicleData.placa ||
        vehicle.chassi === vehicleData.chassi ||
        vehicle.renavam === vehicleData.renavam
      );
    });
  }

  public async create(vehicleData: VehicleWithoutId): Promise<VehicleRecord> {
    const vehicles = await this.read();

    const createdVehicle: VehicleRecord = {
      id: randomUUID(),
      ...vehicleData,
    };

    vehicles.push(createdVehicle);
    await this.write(vehicles);

    return createdVehicle;
  }

  public async update(
    id: string,
    vehicleData: VehicleWithoutId
  ): Promise<VehicleRecord | null> {
    const vehicles = await this.read();
    const index = vehicles.findIndex((vehicle) => vehicle.id === id);

    if (index === -1) {
      return null;
    }

    const updatedVehicle: VehicleRecord = { ...vehicles[index], ...vehicleData, id };
    vehicles[index] = updatedVehicle;

    await this.write(vehicles);

    return updatedVehicle;
  }

  public async delete(id: string): Promise<boolean> {
    const vehicles = await this.read();
    const filtered = vehicles.filter((vehicle) => vehicle.id !== id);

    if (filtered.length === vehicles.length) {
      return false;
    }

    await this.write(filtered);
    return true;
  }

  private async ensureFile(): Promise<void> {
    const directory = path.dirname(this.filePath);
    await fs.mkdir(directory, { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, "[]", "utf-8");
    }
  }

  private async read(): Promise<VehicleRecord[]> {
    await this.ensureFile();
    const content = await fs.readFile(this.filePath, "utf-8");

    if (!content.trim()) {
      return [];
    }

    const parsed = JSON.parse(content) as unknown;
    return Array.isArray(parsed) ? (parsed as VehicleRecord[]) : [];
  }

  private async write(data: VehicleRecord[]): Promise<void> {
    await this.ensureFile();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }
}