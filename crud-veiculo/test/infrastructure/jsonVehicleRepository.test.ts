import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { JsonVehicleRepository } from "../../src/infrastructure/repositories/JsonVehicleRepository";
import { makeVehicleInput } from "../support/vehicleFixtures";
import { Vehicle } from "../../src/domain/entities/Vehicle";

describe("JsonVehicleRepository", () => {
  let tempDir: string;
  let filePath: string;
  let repository: JsonVehicleRepository;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vehicles-repo-"));
    filePath = path.join(tempDir, "vehicles.json");
    repository = new JsonVehicleRepository(filePath);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("deve iniciar vazio quando arquivo nao existe", async () => {
    const all = await repository.findAll();
    assert.deepEqual(all, []);
  });

  it("deve criar e buscar por id", async () => {
    const payload = new Vehicle(makeVehicleInput()).toData();
    const created = await repository.create(payload);

    const found = await repository.findById(created.id);
    assert.ok(found);
    assert.equal(found?.id, created.id);
  });

  it("deve listar todos os registros", async () => {
    await repository.create(new Vehicle(makeVehicleInput()).toData());
    await repository.create(new Vehicle(makeVehicleInput()).toData());

    const all = await repository.findAll();
    assert.equal(all.length, 2);
  });

  it("deve detectar duplicidade de campos unicos", async () => {
    const first = await repository.create(
      new Vehicle(makeVehicleInput({ placa: "AAA1A11" })).toData()
    );

    const duplicated = await repository.existsByUniqueFields({
      placa: "AAA1A11",
      chassi: "X",
      renavam: "Y",
    });

    const ignored = await repository.existsByUniqueFields(
      {
        placa: "AAA1A11",
        chassi: "X",
        renavam: "Y",
      },
      first.id
    );

    assert.equal(duplicated, true);
    assert.equal(ignored, false);
  });

  it("deve detectar duplicidade por chassi e renavam", async () => {
    await repository.create(
      new Vehicle(
        makeVehicleInput({
          placa: "CCC3C33",
          chassi: "CHASSI-UNICO-1",
          renavam: "RENAVAM-UNICO-1",
        })
      ).toData()
    );

    const duplicatedByChassi = await repository.existsByUniqueFields({
      placa: "DIFERENTE-PLACA",
      chassi: "CHASSI-UNICO-1",
      renavam: "RENAVAM-DIFERENTE",
    });

    const duplicatedByRenavam = await repository.existsByUniqueFields({
      placa: "DIFERENTE-PLACA-2",
      chassi: "CHASSI-DIFERENTE-2",
      renavam: "RENAVAM-UNICO-1",
    });

    assert.equal(duplicatedByChassi, true);
    assert.equal(duplicatedByRenavam, true);
  });

  it("deve atualizar veiculo existente", async () => {
    const created = await repository.create(new Vehicle(makeVehicleInput()).toData());
    const updated = await repository.update(created.id, {
      placa: created.placa,
      chassi: created.chassi,
      renavam: created.renavam,
      modelo: "Atualizado",
      marca: created.marca,
      ano: created.ano,
    });

    assert.ok(updated);
    assert.equal(updated?.modelo, "Atualizado");
  });

  it("deve retornar null ao atualizar inexistente", async () => {
    const updated = await repository.update("404", new Vehicle(makeVehicleInput()).toData());
    assert.equal(updated, null);
  });

  it("deve deletar veiculo existente e retornar false para inexistente", async () => {
    const created = await repository.create(new Vehicle(makeVehicleInput()).toData());
    const deleted = await repository.delete(created.id);
    const notDeleted = await repository.delete("404");

    assert.equal(deleted, true);
    assert.equal(notDeleted, false);
  });

  it("deve retornar array vazio quando arquivo contem objeto invalido", async () => {
    await fs.writeFile(filePath, "{}", "utf-8");
    const all = await repository.findAll();
    assert.deepEqual(all, []);
  });

  it("deve retornar array vazio quando arquivo contem apenas espacos", async () => {
    await fs.writeFile(filePath, "   ", "utf-8");
    const all = await repository.findAll();
    assert.deepEqual(all, []);
  });
});
