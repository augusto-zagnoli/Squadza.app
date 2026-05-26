import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { Game } from '../../core/models/game.model';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.scss'
})
export class GameListComponent implements OnInit {
  games: Game[] = [];
  loading = true;
  actionLoading: { [gameId: number]: boolean } = {};
  messages: { [gameId: number]: string } = {};

  constructor(public auth: AuthService, private gameService: GameService) {}

  ngOnInit() {
    this.loadGames();
  }

  loadGames() {
    this.loading = true;
    this.gameService.getAll().subscribe({
      next: games => { this.games = games; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  isParticipant(game: Game): boolean {
    const userId = this.auth.currentUser()?.id;
    return [...(game.confirmed ?? []), ...(game.waiting ?? [])].some(p => p.userId === userId);
  }

  myParticipation(game: Game) {
    const userId = this.auth.currentUser()?.id;
    return [...(game.confirmed ?? []), ...(game.waiting ?? [])].find(p => p.userId === userId);
  }

  canJoin(game: Game): boolean {
    return game.status === 'Open' || game.status === 'Full';
  }

  join(game: Game) {
    this.actionLoading[game.id] = true;
    this.gameService.join(game.id).subscribe({
      next: res => {
        this.messages[game.id] = res.message;
        this.loadGames();
        this.actionLoading[game.id] = false;
      },
      error: err => {
        this.messages[game.id] = err.error?.message || 'Erro ao se inscrever.';
        this.actionLoading[game.id] = false;
      }
    });
  }

  leave(game: Game) {
    this.actionLoading[game.id] = true;
    this.gameService.leave(game.id).subscribe({
      next: () => { this.loadGames(); this.actionLoading[game.id] = false; },
      error: () => { this.actionLoading[game.id] = false; }
    });
  }

  statusClass(status: string): string {
    return { Open: 'success', Full: 'warning', Closed: 'secondary', Cancelled: 'danger' }[status] || 'secondary';
  }

  statusLabel(status: string): string {
    return { Open: 'Aberto', Full: 'Lotado', Closed: 'Encerrado', Cancelled: 'Cancelado' }[status] || status;
  }
}
