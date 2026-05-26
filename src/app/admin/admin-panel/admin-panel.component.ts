import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { Game } from '../../core/models/game.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  activeTab: 'users' | 'games' = 'users';
  users: User[] = [];
  games: Game[] = [];
  loadingUsers = false;
  loadingGames = false;
  message = '';

  constructor(public auth: AuthService, private gameService: GameService) {}

  ngOnInit() {
    this.loadUsers();
    this.loadGames();
  }

  loadUsers() {
    this.loadingUsers = true;
    this.gameService.getUsers().subscribe({
      next: users => { this.users = users; this.loadingUsers = false; },
      error: () => { this.loadingUsers = false; }
    });
  }

  loadGames() {
    this.loadingGames = true;
    this.gameService.getAll().subscribe({
      next: games => { this.games = games; this.loadingGames = false; },
      error: () => { this.loadingGames = false; }
    });
  }

  toggleAdmin(user: User) {
    this.gameService.toggleAdmin(user.id).subscribe({
      next: res => { this.message = res.message; this.loadUsers(); },
      error: err => { this.message = err.error?.message || 'Erro.'; }
    });
  }

  updateStatus(game: Game, status: string) {
    this.gameService.updateStatus(game.id, status).subscribe({
      next: () => { this.message = 'Status atualizado.'; this.loadGames(); },
      error: err => { this.message = err.error?.message || 'Erro.'; }
    });
  }

  statusLabel(status: string): string {
    return { Open: 'Aberto', Full: 'Lotado', Closed: 'Encerrado', Cancelled: 'Cancelado' }[status] || status;
  }

  statusBadge(status: string): string {
    return { Open: 'success', Full: 'warning', Closed: 'secondary', Cancelled: 'danger' }[status] || 'secondary';
  }
}
