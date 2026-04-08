import type { Request, Response } from "express";
import type { VehicleInput } from "../../../domain/entities/Vehicle";
import { CreateVehicleUseCase } from "../../../application/use-cases/CreateVehicleUseCase";
import { DeleteVehicleUseCase } from "../../../application/use-cases/DeleteVehicleUseCase";
import { GetVehicleByIdUseCase } from "../../../application/use-cases/GetVehicleByIdUseCase";
import { ListVehiclesUseCase } from "../../../application/use-cases/ListVehiclesUseCase";
import { UpdateVehicleUseCase } from "../../../application/use-cases/UpdateVehicleUseCase";

interface VehicleUseCases {
  create: CreateVehicleUseCase;
  list: ListVehiclesUseCase;
  getById: GetVehicleByIdUseCase;
  update: UpdateVehicleUseCase;
  delete: DeleteVehicleUseCase;
}

export class VehicleController {
  constructor(private readonly useCases: VehicleUseCases) {}

  private getRequestId(req: Request): string {
    const { id } = req.params;
    return Array.isArray(id) ? id[0] : id;
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const vehicle = await this.useCases.create.execute(req.body as VehicleInput);
    return res.status(201).json(vehicle);
  }

  public async list(_req: Request, res: Response): Promise<Response> {
    const vehicles = await this.useCases.list.execute();
    return res.status(200).json(vehicles);
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    const vehicle = await this.useCases.getById.execute(this.getRequestId(req));
    return res.status(200).json(vehicle);
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const vehicle = await this.useCases.update.execute(
      this.getRequestId(req),
      req.body as Partial<Omit<VehicleInput, "id">>
    );

    return res.status(200).json(vehicle);
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    await this.useCases.delete.execute(this.getRequestId(req));
    return res.status(204).send();
  }
}
