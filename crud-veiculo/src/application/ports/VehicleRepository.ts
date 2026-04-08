import type {
  VehicleRecord,
  VehicleWithoutId,
} from "../../domain/entities/Vehicle";

export interface UniqueVehicleFields {
  placa: string;
  chassi: string;
  renavam: string;
}

export abstract class VehicleRepository {
  public abstract findAll(): Promise<VehicleRecord[]>;

  public abstract findById(id: string): Promise<VehicleRecord | null>;

  public abstract existsByUniqueFields(
    vehicleData: UniqueVehicleFields,
    ignoreId?: string | null
  ): Promise<boolean>;

  public abstract create(vehicleData: VehicleWithoutId): Promise<VehicleRecord>;

  public abstract update(
    id: string,
    vehicleData: VehicleWithoutId
  ): Promise<VehicleRecord | null>;

  public abstract delete(id: string): Promise<boolean>;
}