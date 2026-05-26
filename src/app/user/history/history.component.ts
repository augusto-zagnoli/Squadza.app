import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { HistoryItem } from '../../core/models/user.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  history: HistoryItem[] = [];
  loading = true;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getHistory().subscribe({
      next: h => { this.history = h; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  paymentBadge(status: string): string {
    return { Pending: 'secondary', Submitted: 'info', Confirmed: 'success', Rejected: 'danger' }[status] || 'secondary';
  }

  statusBadge(status: string): string {
    return { Confirmed: 'success', Waiting: 'warning', Removed: 'secondary' }[status] || 'secondary';
  }
}
