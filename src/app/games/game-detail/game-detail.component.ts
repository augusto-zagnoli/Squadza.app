import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  signing = false;
  cancelling = false;
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
      if (updated.id === this.gameId) {
        // preserve myStatus/myPosition from the last HTTP load — SignalR payload doesn't carry them
        updated.myStatus = this.game?.myStatus;
        updated.myPosition = this.game?.myPosition;
        this.game = updated;
      }
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

  signupForGame() {
    const user = this.auth.currentUser();
    if (!user?.cpfNormalized) {
      this.actionError = 'Sua conta não possui CPF cadastrado. Cadastre-se novamente informando seu CPF.';
      return;
    }
    this.signing = true;
    this.clearMessages();
    this.gameService.signupPublic(this.gameId, user.name, user.cpfNormalized).subscribe({
      next: () => { this.actionMsg = 'Inscrição realizada com sucesso!'; this.signing = false; this.loadGame(); },
      error: err => { this.actionError = err.error?.message || 'Erro ao se inscrever.'; this.signing = false; }
    });
  }

  cancelMySignup() {
    const user = this.auth.currentUser();
    if (!user?.cpfNormalized) return;
    this.cancelling = true;
    this.clearMessages();
    this.gameService.cancelPublic(this.gameId, user.cpfNormalized).subscribe({
      next: () => { this.actionMsg = 'Inscrição cancelada.'; this.cancelling = false; this.loadGame(); },
      error: err => { this.actionError = err.error?.message || 'Erro ao cancelar.'; this.cancelling = false; }
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

  get canSignupForGame(): boolean {
    return !!this.game && (this.game.status === 'Open' || this.game.status === 'Full') && !this.game.myStatus;
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
