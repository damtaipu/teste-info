import express, { type Express } from "express";
import path from "node:path";
import { VehicleRepository } from "./application/ports/VehicleRepository";
import { CreateVehicleUseCase } from "./application/use-cases/CreateVehicleUseCase";
import { DeleteVehicleUseCase } from "./application/use-cases/DeleteVehicleUseCase";
import { GetVehicleByIdUseCase } from "./application/use-cases/GetVehicleByIdUseCase";
import { ListVehiclesUseCase } from "./application/use-cases/ListVehiclesUseCase";
import { UpdateVehicleUseCase } from "./application/use-cases/UpdateVehicleUseCase";
import { JsonVehicleRepository } from "./infrastructure/repositories/JsonVehicleRepository";
import { VehicleController } from "./interfaces/http/controllers/VehicleController";
import { errorHandler } from "./interfaces/http/middlewares/errorHandler";
import { buildVehicleRoutes } from "./interfaces/http/routes/vehicleRoutes";

interface BuildAppOptions {
  repository?: VehicleRepository;
  dataFilePath?: string;
}

export const buildApp = (options: BuildAppOptions = {}): Express => {
  const app = express();
  app.use(express.json());

  const repository =
    options.repository ??
    new JsonVehicleRepository(
      options.dataFilePath ?? path.resolve(process.cwd(), "data", "vehicles.json")
    );

  const useCases = {
    create: new CreateVehicleUseCase(repository),
    list: new ListVehiclesUseCase(repository),
    getById: new GetVehicleByIdUseCase(repository),
    update: new UpdateVehicleUseCase(repository),
    delete: new DeleteVehicleUseCase(repository),
  };

  const controller = new VehicleController(useCases);

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use("/api", buildVehicleRoutes(controller));
  app.use(errorHandler);

  return app;
};
