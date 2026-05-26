import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-game.component.html',
  styleUrl: './create-game.component.scss'
})
export class CreateGameComponent {
  gameDate = '';
  gameTime = '19:00';
  location = '';
  pricePerPerson = 10;
  maxPlayers = 24;
  error = '';
  loading = false;

  constructor(private gameService: GameService, private router: Router) {}

  submit() {
    this.error = '';
    this.loading = true;
    this.gameService.create({
      gameDate: new Date(this.gameDate).toISOString(),
      gameTime: this.gameTime,
      location: this.location,
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
