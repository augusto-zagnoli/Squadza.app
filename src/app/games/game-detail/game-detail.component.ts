import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { SignalRService } from '../../core/services/signalr.service';
import { Game, Participant } from '../../core/models/game.model';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss'
})
export class GameDetailComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  loading = true;
  actionMsg = '';
  actionError = '';
  uploading = false;
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

  get myParticipation(): Participant | undefined {
    const uid = this.auth.currentUser()?.id;
    return [...(this.game?.confirmed ?? []), ...(this.game?.waiting ?? [])].find(p => p.userId === uid);
  }

  join() {
    this.clearMessages();
    this.gameService.join(this.gameId).subscribe({
      next: res => { this.actionMsg = res.message; },
      error: err => { this.actionError = err.error?.message || 'Erro ao se inscrever.'; }
    });
  }

  leave() {
    this.clearMessages();
    this.gameService.leave(this.gameId).subscribe({
      next: () => { this.actionMsg = 'Inscrição cancelada.'; },
      error: err => { this.actionError = err.error?.message || 'Erro ao cancelar.'; }
    });
  }

  remove(p: Participant) {
    this.clearMessages();
    this.gameService.removeParticipant(p.userId, this.gameId).subscribe({
      next: res => { this.actionMsg = res.message; },
      error: err => { this.actionError = err.error?.message || 'Erro ao remover.'; }
    });
  }

  onFileSelected(event: Event, participantId: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploading = true;
    this.clearMessages();
    this.gameService.uploadProof(participantId, input.files[0]).subscribe({
      next: res => { this.actionMsg = res.message; this.uploading = false; },
      error: err => { this.actionError = err.error?.message || 'Erro ao enviar comprovante.'; this.uploading = false; }
    });
  }

  reviewPayment(participantId: number, approved: boolean, reason?: string) {
    this.clearMessages();
    this.gameService.reviewPayment(participantId, approved, reason).subscribe({
      next: res => { this.actionMsg = res.message; },
      error: err => { this.actionError = err.error?.message || 'Erro ao revisar pagamento.'; }
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

  paymentBadge(status: string): string {
    return { Pending: 'secondary', Submitted: 'info', Confirmed: 'success', Rejected: 'danger' }[status] || 'secondary';
  }

  paymentLabel(status: string): string {
    return { Pending: 'Pendente', Submitted: 'Enviado', Confirmed: 'Confirmado', Rejected: 'Rejeitado' }[status] || status;
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
