import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { CourtService } from '../../core/services/court.service';
import { Court } from '../../core/models/court.model';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-game.component.html',
  styleUrl: './create-game.component.scss'
})
export class CreateGameComponent implements OnInit {
  gameDate = '';
  gameTime = '19:00';
  courtId: number | null = null;
  pricePerPerson = 10;
  maxPlayers = 24;
  error = '';
  loading = false;
  courts: Court[] = [];
  courtsLoading = true;

  constructor(
    private gameService: GameService,
    private courtService: CourtService,
    private router: Router
  ) {}

  ngOnInit() {
    this.courtService.getActive().subscribe({
      next: courts => { this.courts = courts; this.courtsLoading = false; },
      error: () => { this.courtsLoading = false; }
    });
  }

  submit() {
    if (!this.courtId) { this.error = 'Selecione uma quadra.'; return; }
    this.error = '';
    this.loading = true;
    this.gameService.create({
      gameDate: new Date(this.gameDate).toISOString(),
      gameTime: this.gameTime,
      courtId: this.courtId,
      pricePerPerson: this.pricePerPerson,
      maxPlayers: this.maxPlayers
    }).subscribe({
      next: game => this.router.navigate(['/games', game.id]),
      error: err => {
        this.error = err.error?.message || 'Erro ao criar jogo.';
        this.loading = false;
      }
    });
  }
}
