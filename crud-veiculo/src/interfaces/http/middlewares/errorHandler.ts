import type { ErrorRequestHandler } from "express";
import { AppError } from "../../../domain/errors/AppError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Erro interno do servidor.",
  });
};