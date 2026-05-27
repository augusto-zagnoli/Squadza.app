import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { SignalRService } from '../../core/services/signalr.service';
import { Game, Participant } from '../../core/models/game.model';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss'
})
export class GameDetailComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  loading = true;
  actionMsg = '';
  actionError = '';
  drawing = false;
  private gameId = 0;
  private signalSub?: Subscription;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private gameService: GameService,
    private signalR: SignalRService
  ) {}

  ngOnInit() {
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadGame();

    this.signalSub = this.signalR.gameUpdated$.subscribe(updated => {
      if (updated.id === this.gameId) this.game = updated;
    });
    this.signalR.startConnection(this.gameId);
  }

  ngOnDestroy() {
    this.signalSub?.unsubscribe();
    this.signalR.stopConnection(this.gameId);
  }

  loadGame() {
    this.loading = true;
    this.gameService.getById(this.gameId).subscribe({
      next: game => { this.game = game; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  remove(p: Participant) {
    this.clearMessages();
    this.gameService.removeParticipant(p.id, this.gameId).subscribe({
      next: res => { this.actionMsg = res.message; },
      error: err => { this.actionError = err.error?.message || 'Erro ao remover.'; }
    });
  }

  drawTeams() {
    this.drawing = true;
    this.clearMessages();
    this.gameService.drawTeams(this.gameId).subscribe({
      next: () => { this.actionMsg = 'Times sorteados!'; this.drawing = false; },
      error: err => { this.actionError = err.error?.message || 'Erro ao sortear.'; this.drawing = false; }
    });
  }

  statusBadge(status: string): string {
    return { Open: 'success', Full: 'warning', Closed: 'secondary', Cancelled: 'danger' }[status] || 'secondary';
  }

  statusLabel(status: string): string {
    return { Open: 'Aberto', Full: 'Lotado', Closed: 'Encerrado', Cancelled: 'Cancelado' }[status] || status;
  }

  teamColors = ['primary', 'success', 'danger', 'warning'];

  private clearMessages() { this.actionMsg = ''; this.actionError = ''; }
}
