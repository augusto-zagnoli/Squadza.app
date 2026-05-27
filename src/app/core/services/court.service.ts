import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Court, CreateCourtDto, UpdateCourtDto } from '../models/court.model';

const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CourtService {
  constructor(private http: HttpClient) {}

  getActive() {
    return this.http.get<Court[]>(`${API_URL}/courts`);
  }

  getAll() {
    return this.http.get<Court[]>(`${API_URL}/courts/all`);
  }

  create(dto: CreateCourtDto) {
    return this.http.post<Court>(`${API_URL}/courts`, dto);
  }

  update(id: number, dto: UpdateCourtDto) {
    return this.http.put<Court>(`${API_URL}/courts/${id}`, dto);
  }

  toggle(id: number) {
    return this.http.patch<void>(`${API_URL}/courts/${id}/toggle`, {});
  }
}
