import assert from "node:assert/strict";
import { Vehicle } from "../../src/domain/entities/Vehicle";
import { ValidationError } from "../../src/domain/errors/ValidationError";
import { makeVehicleInput } from "../support/vehicleFixtures";

describe("Vehicle Entity", () => {
  it("deve normalizar campos e transformar placa/chassi/renavam para uppercase", () => {
    const vehicle = new Vehicle(
      makeVehicleInput({
        placa: " abc1d23 ",
        chassi: " 9bwzzz377vt004251 ",
        renavam: " 12345678901 ",
        modelo: " Civic ",
        marca: " Honda ",
      })
    );

    const data = vehicle.toData();
    assert.equal(data.placa, "ABC1D23");
    assert.equal(data.chassi, "9BWZZZ377VT004251");
    assert.equal(data.renavam, "12345678901");
    assert.equal(data.modelo, "Civic");
    assert.equal(data.marca, "Honda");
  });

  it("deve aceitar ano como string numerica", () => {
    const vehicle = new Vehicle(makeVehicleInput({ ano: "2025" }));
    assert.equal(vehicle.toData().ano, 2025);
  });

  it("deve validar campos obrigatorios", () => {
    assert.throws(() => {
      new Vehicle(makeVehicleInput({ placa: "" }));
    }, ValidationError);
  });

  it("deve validar ano nao inteiro", () => {
    assert.throws(() => {
      new Vehicle(makeVehicleInput({ ano: "abc" }));
    }, ValidationError);
  });

  it("deve validar ano fora da faixa", () => {
    assert.throws(() => {
      new Vehicle(makeVehicleInput({ ano: 1500 }));
    }, ValidationError);
  });
});
