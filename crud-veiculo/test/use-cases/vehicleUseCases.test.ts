import assert from "node:assert/strict";
import { CreateVehicleUseCase } from "../../src/application/use-cases/CreateVehicleUseCase";
import { DeleteVehicleUseCase } from "../../src/application/use-cases/DeleteVehicleUseCase";
import { GetVehicleByIdUseCase } from "../../src/application/use-cases/GetVehicleByIdUseCase";
import { ListVehiclesUseCase } from "../../src/application/use-cases/ListVehiclesUseCase";
import { UpdateVehicleUseCase } from "../../src/application/use-cases/UpdateVehicleUseCase";
import { ConflictError } from "../../src/domain/errors/ConflictError";
import { NotFoundError } from "../../src/domain/errors/NotFoundError";
import { ValidationError } from "../../src/domain/errors/ValidationError";
import { VehicleRepository } from "../../src/application/ports/VehicleRepository";
import type {
  UniqueVehicleFields,
} from "../../src/application/ports/VehicleRepository";
import type {
  VehicleRecord,
  VehicleWithoutId,
} from "../../src/domain/entities/Vehicle";
import { InMemoryVehicleRepository } from "../support/InMemoryVehicleRepository";
import { makeVehicleInput } from "../support/vehicleFixtures";

describe("Vehicle Use Cases", () => {
  let repository: InMemoryVehicleRepository;
  let createVehicle: CreateVehicleUseCase;
  let listVehicles: ListVehiclesUseCase;
  let getVehicleById: GetVehicleByIdUseCase;
  let updateVehicle: UpdateVehicleUseCase;
  let deleteVehicle: DeleteVehicleUseCase;

  beforeEach(() => {
    repository = new InMemoryVehicleRepository();
    createVehicle = new CreateVehicleUseCase(repository);
    listVehicles = new ListVehiclesUseCase(repository);
    getVehicleById = new GetVehicleByIdUseCase(repository);
    updateVehicle = new UpdateVehicleUseCase(repository);
    deleteVehicle = new DeleteVehicleUseCase(repository);
  });

  it("create: deve criar veiculo valido", async () => {
    const created = await createVehicle.execute(makeVehicleInput());

    assert.ok(created.id);
    assert.equal(created.placa.startsWith("ABC1D"), true);
  });

  it("create: deve falhar ao criar duplicado", async () => {
    const base = makeVehicleInput();
    await createVehicle.execute(base);

    await assert.rejects(async () => {
      await createVehicle.execute({
        ...makeVehicleInput(),
        placa: base.placa,
      });
    }, ConflictError);
  });

  it("list: deve retornar vazio sem registros", async () => {
    const list = await listVehicles.execute();
    assert.deepEqual(list, []);
  });

  it("read: deve listar e buscar por id", async () => {
    const created = await createVehicle.execute(makeVehicleInput());

    const list = await listVehicles.execute();
    const found = await getVehicleById.execute(created.id);

    assert.equal(list.length, 1);
    assert.equal(found.id, created.id);
  });

  it("read: deve falhar com id vazio", async () => {
    await assert.rejects(async () => {
      await getVehicleById.execute("");
    }, ValidationError);
  });

  it("read: deve falhar quando nao encontrar id", async () => {
    await assert.rejects(async () => {
      await getVehicleById.execute("inexistente");
    }, NotFoundError);
  });

  it("update: deve atualizar dados de veiculo existente", async () => {
    const created = await createVehicle.execute(makeVehicleInput());

    const updated = await updateVehicle.execute(created.id, {
      modelo: "Novo Modelo",
      ano: 2024,
    });

    assert.equal(updated.modelo, "Novo Modelo");
    assert.equal(updated.ano, 2024);
  });

  it("update: deve falhar com id vazio", async () => {
    await assert.rejects(async () => {
      await updateVehicle.execute("", { modelo: "x" });
    }, ValidationError);
  });

  it("update: deve falhar quando veiculo nao existir", async () => {
    await assert.rejects(async () => {
      await updateVehicle.execute("404", { modelo: "x" });
    }, NotFoundError);
  });

  it("update: deve falhar em conflito de campos unicos", async () => {
    const one = await createVehicle.execute(makeVehicleInput({ placa: "AAA1A11" }));
    await createVehicle.execute(makeVehicleInput({ placa: "BBB2B22" }));

    await assert.rejects(async () => {
      await updateVehicle.execute(one.id, { placa: "BBB2B22" });
    }, ConflictError);
  });

  it("update: deve falhar se repositorio retornar null no update final", async () => {
    class UpdateReturningNullRepository extends VehicleRepository {
      public async findAll(): Promise<VehicleRecord[]> {
        return [];
      }
      public async findById(id: string): Promise<VehicleRecord | null> {
        return {
          id,
          placa: "ABC1D23",
          chassi: "9BWZZZ377VT004251",
          renavam: "12345678901",
          modelo: "Civic",
          marca: "Honda",
          ano: 2023,
        };
      }
      public async existsByUniqueFields(
        _vehicleData: UniqueVehicleFields,
        _ignoreId?: string | null
      ): Promise<boolean> {
        return false;
      }
      public async create(_vehicleData: VehicleWithoutId): Promise<VehicleRecord> {
        throw new Error("nao utilizado");
      }
      public async update(
        _id: string,
        _vehicleData: VehicleWithoutId
      ): Promise<VehicleRecord | null> {
        return null;
      }
      public async delete(_id: string): Promise<boolean> {
        return false;
      }
    }

    const failingUpdateUseCase = new UpdateVehicleUseCase(
      new UpdateReturningNullRepository()
    );

    await assert.rejects(async () => {
      await failingUpdateUseCase.execute("id-1", { modelo: "X" });
    }, NotFoundError);
  });

  it("delete: deve remover veiculo existente", async () => {
    const created = await createVehicle.execute(makeVehicleInput());
    await deleteVehicle.execute(created.id);

    await assert.rejects(async () => {
      await getVehicleById.execute(created.id);
    }, NotFoundError);
  });

  it("delete: deve falhar com id vazio", async () => {
    await assert.rejects(async () => {
      await deleteVehicle.execute("");
    }, ValidationError);
  });

  it("delete: deve falhar quando veiculo nao existir", async () => {
    await assert.rejects(async () => {
      await deleteVehicle.execute("404");
    }, NotFoundError);
  });
});
