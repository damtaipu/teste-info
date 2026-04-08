import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { buildApp } from "../../../src/app";
import {
  VehicleRepository,
  type UniqueVehicleFields,
} from "../../../src/application/ports/VehicleRepository";
import type {
  VehicleRecord,
  VehicleWithoutId,
} from "../../../src/domain/entities/Vehicle";
import { makeVehicleInput } from "../../support/vehicleFixtures";

class FailingRepository extends VehicleRepository {
  public async findAll(): Promise<VehicleRecord[]> {
    throw new Error("falha inesperada");
  }
  public async findById(_id: string): Promise<VehicleRecord | null> {
    throw new Error("falha inesperada");
  }
  public async existsByUniqueFields(
    _vehicleData: UniqueVehicleFields,
    _ignoreId?: string | null
  ): Promise<boolean> {
    throw new Error("falha inesperada");
  }
  public async create(_vehicleData: VehicleWithoutId): Promise<VehicleRecord> {
    throw new Error("falha inesperada");
  }
  public async update(
    _id: string,
    _vehicleData: VehicleWithoutId
  ): Promise<VehicleRecord | null> {
    throw new Error("falha inesperada");
  }
  public async delete(_id: string): Promise<boolean> {
    throw new Error("falha inesperada");
  }
}

describe("HTTP Routes", () => {
  let tempDir: string;
  let filePath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vehicles-http-"));
    filePath = path.join(tempDir, "vehicles.json");
    await fs.writeFile(filePath, "[]", "utf-8");
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("GET /health deve retornar status ok", async () => {
    const app = buildApp({ dataFilePath: filePath });

    const response = await request(app).get("/health");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: "ok" });
  });

  it("CRUD completo deve funcionar via API", async () => {
    const app = buildApp({ dataFilePath: filePath });

    const createResponse = await request(app)
      .post("/api/vehicles")
      .send(makeVehicleInput({ placa: "abc1d23" }));

    assert.equal(createResponse.status, 201);
    assert.ok(createResponse.body.id);
    assert.equal(createResponse.body.placa, "ABC1D23");

    const createdId = createResponse.body.id as string;

    const listResponse = await request(app).get("/api/vehicles");
    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.length, 1);

    const getResponse = await request(app).get(`/api/vehicles/${createdId}`);
    assert.equal(getResponse.status, 200);
    assert.equal(getResponse.body.id, createdId);

    const updateResponse = await request(app)
      .put(`/api/vehicles/${createdId}`)
      .send({ modelo: "Modelo API", ano: 2024 });
    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.modelo, "Modelo API");

    const deleteResponse = await request(app).delete(`/api/vehicles/${createdId}`);
    assert.equal(deleteResponse.status, 204);
  });

  it("POST /api/vehicles deve retornar 400 para payload invalido", async () => {
    const app = buildApp({ dataFilePath: filePath });

    const response = await request(app).post("/api/vehicles").send({
      placa: "",
      chassi: "",
      renavam: "",
      modelo: "",
      marca: "",
      ano: "abc",
    });

    assert.equal(response.status, 400);
    assert.equal(typeof response.body.message, "string");
  });

  it("GET /api/vehicles/:id deve retornar 404 para id inexistente", async () => {
    const app = buildApp({ dataFilePath: filePath });
    const response = await request(app).get("/api/vehicles/nao-existe");

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Veiculo nao encontrado.");
  });

  it("PUT /api/vehicles/:id deve retornar 404 para id inexistente", async () => {
    const app = buildApp({ dataFilePath: filePath });
    const response = await request(app)
      .put("/api/vehicles/nao-existe")
      .send({ modelo: "Teste" });

    assert.equal(response.status, 404);
  });

  it("DELETE /api/vehicles/:id deve retornar 404 para id inexistente", async () => {
    const app = buildApp({ dataFilePath: filePath });
    const response = await request(app).delete("/api/vehicles/nao-existe");

    assert.equal(response.status, 404);
  });

  it("deve retornar 500 para erro inesperado", async () => {
    const app = buildApp({ repository: new FailingRepository() });
    const response = await request(app).get("/api/vehicles");

    assert.equal(response.status, 500);
    assert.equal(response.body.message, "Erro interno do servidor.");
  });
});
