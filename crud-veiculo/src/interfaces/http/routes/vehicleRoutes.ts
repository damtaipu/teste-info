import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { VehicleController } from "../controllers/VehicleController";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

const asyncHandler = (handler: AsyncRouteHandler): RequestHandler => {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export const buildVehicleRoutes = (vehicleController: VehicleController): Router => {
  const router = Router();

  router.post(
    "/vehicles",
    asyncHandler((req, res) => vehicleController.create(req, res))
  );
  router.get(
    "/vehicles",
    asyncHandler((req, res) => vehicleController.list(req, res))
  );
  router.get(
    "/vehicles/:id",
    asyncHandler((req, res) => vehicleController.getById(req, res))
  );
  router.put(
    "/vehicles/:id",
    asyncHandler((req, res) => vehicleController.update(req, res))
  );
  router.delete(
    "/vehicles/:id",
    asyncHandler((req, res) => vehicleController.delete(req, res))
  );

  return router;
};