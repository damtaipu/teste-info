import { ValidationError } from "../errors/ValidationError";

export interface VehicleInput {
  id?: string;
  placa: string;
  chassi: string;
  renavam: string;
  modelo: string;
  marca: string;
  ano: number | string;
}

export interface VehicleRecord {
  id: string;
  placa: string;
  chassi: string;
  renavam: string;
  modelo: string;
  marca: string;
  ano: number;
}

export type VehicleWithoutId = Omit<VehicleRecord, "id">;

export class Vehicle {
  public readonly placa: string;
  public readonly chassi: string;
  public readonly renavam: string;
  public readonly modelo: string;
  public readonly marca: string;
  public readonly ano: number;

  constructor({ placa, chassi, renavam, modelo, marca, ano }: VehicleInput) {
    this.placa = Vehicle.normalizeText(placa, "placa", true);
    this.chassi = Vehicle.normalizeText(chassi, "chassi", true);
    this.renavam = Vehicle.normalizeText(renavam, "renavam", true);
    this.modelo = Vehicle.normalizeText(modelo, "modelo");
    this.marca = Vehicle.normalizeText(marca, "marca");
    this.ano = Vehicle.normalizeYear(ano);
  }

  private static normalizeText(
    value: string,
    fieldName: string,
    toUpperCase = false
  ): string {
    if (typeof value !== "string" || value.trim() === "") {
      throw new ValidationError(`O campo '${fieldName}' e obrigatorio.`);
    }

    return toUpperCase ? value.trim().toUpperCase() : value.trim();
  }

  private static normalizeYear(value: number | string): number {
    const parsedYear = Number.parseInt(String(value), 10);
    const currentYear = new Date().getFullYear();

    if (!Number.isInteger(parsedYear)) {
      throw new ValidationError("O campo 'ano' deve ser um numero inteiro.");
    }

    if (parsedYear < 1886 || parsedYear > currentYear + 1) {
      throw new ValidationError(
        `O campo 'ano' deve estar entre 1886 e ${currentYear + 1}.`
      );
    }

    return parsedYear;
  }

  public toData(): VehicleWithoutId {
    return {
      placa: this.placa,
      chassi: this.chassi,
      renavam: this.renavam,
      modelo: this.modelo,
      marca: this.marca,
      ano: this.ano,
    };
  }
}