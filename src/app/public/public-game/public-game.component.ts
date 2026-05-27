import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { PublicGame } from '../../core/models/public.model';
import { API_URL, HUB_URL } from '../../core/services/auth.service';

const CPF_KEY = 'squadza_public_cpf';
const NAME_KEY = 'squadza_public_name';

@Component({
  selector: 'app-public-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-game.component.html',
  styleUrl: './public-game.component.scss'
})
export class PublicGameComponent implements OnInit, OnDestroy {
  games: PublicGame[] = [];
  game: PublicGame | null = null;
  selectedGameId: number | null = null;

  name = '';
  cpf = '';
  error = '';
  successMsg = '';
  loading = false;
  cancelling = false;

  private connection: signalR.HubConnection | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.selectedGameId = +id;
      this.loadGame(this.selectedGameId);
    } else {
      this.loadGames();
    }

    this.name = localStorage.getItem(NAME_KEY) ?? '';
    this.cpf = localStorage.getItem(CPF_KEY) ?? '';
  }

  ngOnDestroy() {
    if (this.connection) this.connection.stop();
  }

  loadGames() {
    this.http.get<PublicGame[]>(`${API_URL}/public/games`).subscribe({
      next: games => this.games = games
    });
  }

  selectGame(id: number) {
    this.router.navigate(['/inscricao', id]);
  }

  loadGame(id: number) {
    this.http.get<PublicGame>(`${API_URL}/public/games/${id}`).subscribe({
      next: game => {
        this.game = game;
        this.startSignalR(id);
      }
    });
  }

  get myConfirmedEntry() {
    const storedName = localStorage.getItem(NAME_KEY);
    if (!storedName || !this.cpf) return null;
    return this.game?.confirmed.find(p => p.name === storedName) ?? null;
  }

  get myWaitingEntry() {
    const storedName = localStorage.getItem(NAME_KEY);
    if (!storedName || !this.cpf) return null;
    return this.game?.waiting.find(p => p.name === storedName) ?? null;
  }

  get isMySelf(): boolean {
    return !!this.myConfirmedEntry;
  }

  get isMySelfWaiting(): boolean {
    return !!this.myWaitingEntry;
  }

  signup() {
    const cpfNorm = this.cpf.replace(/\D/g, '');
    if (cpfNorm.length !== 11) { this.error = 'CPF inválido. Informe os 11 dígitos.'; return; }
    if (!this.name.trim()) { this.error = 'Informe seu nome.'; return; }

    this.error = ''; this.successMsg = ''; this.loading = true;

    this.http.post<PublicGame>(`${API_URL}/public/games/${this.selectedGameId}/signup`, {
      name: this.name.trim(),
      cpf: this.cpf
    }).subscribe({
      next: game => {
        this.game = game;
        localStorage.setItem(NAME_KEY, this.name.trim());
        localStorage.setItem(CPF_KEY, this.cpf);
        const isWaiting = game.waiting.some(p => p.name === this.name.trim());
        this.successMsg = isWaiting
          ? 'Você entrou na lista de espera!'
          : 'Inscrição realizada com sucesso!';
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao se inscrever.';
        this.loading = false;
      }
    });
  }

  cancelSignup() {
    this.cancelling = true; this.error = ''; this.successMsg = '';
    this.http.delete<PublicGame>(`${API_URL}/public/games/${this.selectedGameId}/signup`, {
      body: { cpf: this.cpf }
    }).subscribe({
      next: game => {
        this.game = game;
        this.successMsg = 'Inscrição cancelada.';
        this.cancelling = false;
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao cancelar.';
        this.cancelling = false;
      }
    });
  }

  formatCpf(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) formatted = `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
    else if (digits.length > 6) formatted = `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
    else if (digits.length > 3) formatted = `${digits.slice(0,3)}.${digits.slice(3)}`;
    this.cpf = formatted;
  }

  get spotsLeft(): number {
    return Math.max(0, (this.game?.maxPlayers ?? 0) - (this.game?.confirmedCount ?? 0));
  }

  private async startSignalR(gameId: number) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    this.connection.on('PublicListUpdated', (updated: PublicGame) => {
      this.game = updated;
    });

    try {
      await this.connection.start();
      await this.connection.invoke('JoinPublicGroup', gameId.toString());
    } catch (err) {
      console.error('SignalR error:', err);
    }
  }

  statusBadge(status: string): string {
    return { Open: 'success', Full: 'warning', Closed: 'secondary', Cancelled: 'secondary' }[status] || 'secondary';
  }

  statusLabel(status: string): string {
    return { Open: 'Aberta', Full: 'Lista Cheia', Closed: 'Encerrada', Cancelled: 'Cancelado' }[status] || status;
  }
}
