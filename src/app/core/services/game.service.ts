import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateGameDto, Game, Team } from '../models/game.model';
import { User, HistoryItem } from '../models/user.model';
import { API_URL } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Game[]>(`${API_URL}/games`);
  }

  getById(id: number) {
    return this.http.get<Game>(`${API_URL}/games/${id}`);
  }

  create(dto: CreateGameDto) {
    return this.http.post<Game>(`${API_URL}/games`, dto);
  }

  updateStatus(id: number, status: string) {
    return this.http.put(`${API_URL}/games/${id}/status`, { status });
  }

  join(gameId: number) {
    return this.http.post<{ message: string; participantId: number }>(
      `${API_URL}/participants/join/${gameId}`, {}
    );
  }

  leave(gameId: number) {
    return this.http.delete<{ message: string }>(`${API_URL}/participants/leave/${gameId}`);
  }

  removeParticipant(userId: number, gameId: number) {
    return this.http.delete<{ message: string }>(
      `${API_URL}/participants/${userId}/remove?gameId=${gameId}`
    );
  }

  uploadProof(participantId: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ message: string }>(`${API_URL}/payments/${participantId}/upload`, form);
  }

  reviewPayment(participantId: number, approved: boolean, rejectionReason?: string) {
    return this.http.post<{ message: string }>(
      `${API_URL}/payments/${participantId}/review`,
      { approved, rejectionReason }
    );
  }

  drawTeams(gameId: number) {
    return this.http.post<Team[]>(`${API_URL}/teams/draw/${gameId}`, {});
  }

  getUsers() {
    return this.http.get<User[]>(`${API_URL}/users`);
  }

  toggleAdmin(userId: number) {
    return this.http.put<{ message: string }>(`${API_URL}/users/${userId}/toggle-admin`, {});
  }

  getHistory() {
    return this.http.get<HistoryItem[]>(`${API_URL}/users/me/history`);
  }
}
