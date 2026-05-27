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

  constructor(public auth: AuthService, private gameService: GameService) {}

  ngOnInit() {
    this.loading = true;
    this.gameService.getAll().subscribe({
      next: games => { this.games = games; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  canSignup(game: Game): boolean {
    return game.status === 'Open' || game.status === 'Full';
  }

  statusClass(status: string): string {
    return { Open: 'success', Full: 'warning', Closed: 'secondary', Cancelled: 'danger' }[status] || 'secondary';
  }

  statusLabel(status: string): string {
    return { Open: 'Aberto', Full: 'Lotado', Closed: 'Encerrado', Cancelled: 'Cancelado' }[status] || status;
  }
}
