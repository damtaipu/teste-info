import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Vehicle, VehiclePayload } from '../models/vehicle.model';
import { VehiclesRepositoryPort } from '../ports/vehicles-repository.port';
import { API_BASE_URL } from '../tokens/api-base-url.token';

@Injectable()
export class HttpVehiclesRepositoryService extends VehiclesRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiBaseUrl}/vehicles`).pipe(
      map((vehicles) =>
        vehicles
          .map((vehicle) => ({
            ...vehicle,
            placa: vehicle.placa.trim().toUpperCase(),
            chassi: vehicle.chassi.trim().toUpperCase(),
            renavam: vehicle.renavam.trim().toUpperCase(),
            modelo: vehicle.modelo.trim(),
            marca: vehicle.marca.trim(),
          }))
          .sort((a, b) => a.placa.localeCompare(b.placa, 'pt-BR'))
      )
    );
  }

  create(payload: VehiclePayload): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiBaseUrl}/vehicles`, payload);
  }

  update(id: string, payload: VehiclePayload): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiBaseUrl}/vehicles/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/vehicles/${id}`);
  }
}