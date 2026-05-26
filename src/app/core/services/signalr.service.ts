import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Game } from '../models/game.model';
import { AuthService, HUB_URL } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection: signalR.HubConnection | null = null;

  private gameUpdatedSource = new Subject<Game>();
  gameUpdated$ = this.gameUpdatedSource.asObservable();

  constructor(private auth: AuthService) {}

  async startConnection(gameId: number): Promise<void> {
    const token = this.auth.getToken();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}?access_token=${token ?? ''}`)
      .withAutomaticReconnect()
      .build();

    this.connection.on('GameUpdated', (game: Game) => {
      this.gameUpdatedSource.next(game);
    });

    try {
      await this.connection.start();
      await this.connection.invoke('JoinGameGroup', gameId.toString());
    } catch (err) {
      console.error('SignalR connection error:', err);
    }
  }

  async stopConnection(gameId: number): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.invoke('LeaveGameGroup', gameId.toString());
      } catch {}
      await this.connection.stop();
      this.connection = null;
    }
  }
}
