import { Observable } from 'rxjs';
import { Vehicle, VehiclePayload } from '../models/vehicle.model';

export abstract class VehiclesRepositoryPort {
  abstract list(): Observable<Vehicle[]>;
  abstract create(payload: VehiclePayload): Observable<Vehicle>;
  abstract update(id: string, payload: VehiclePayload): Observable<Vehicle>;
  abstract delete(id: string): Observable<void>;
}