import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { VehicleController } from "../../../src/interfaces/http/controllers/VehicleController";

describe("VehicleController", () => {
  it("deve usar o primeiro id quando params.id vier como array", async () => {
    const captured: string[] = [];
    const controller = new VehicleController({
      create: { execute: async () => ({}) } as never,
      list: { execute: async () => [] } as never,
      getById: {
        execute: async (id: string) => {
          captured.push(id);
          return { id };
        },
      } as never,
      update: { execute: async () => ({}) } as never,
      delete: { execute: async () => undefined } as never,
    });

    const req = {
      params: { id: ["id-principal", "id-secundario"] },
    } as unknown as Request;

    const res = {
      status(code: number) {
        assert.equal(code, 200);
        return this;
      },
      json(body: unknown) {
        assert.deepEqual(body, { id: "id-principal" });
        return this;
      },
    } as unknown as Response;

    await controller.getById(req, res);
    assert.deepEqual(captured, ["id-principal"]);
  });
});
