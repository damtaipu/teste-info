import type { VehicleInput } from "../../src/domain/entities/Vehicle";

let uniqueSuffix = 0;

export const makeVehicleInput = (
  overrides: Partial<VehicleInput> = {}
): VehicleInput => {
  uniqueSuffix += 1;
  const suffix = String(uniqueSuffix).padStart(2, "0");

  return {
    placa: `ABC1D${suffix}`,
    chassi: `9BWZZZ377VT0042${suffix}`,
    renavam: `123456789${suffix}`,
    modelo: "Civic",
    marca: "Honda",
    ano: 2023,
    ...overrides,
  };
};
