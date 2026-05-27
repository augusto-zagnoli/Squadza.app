import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  collapsed = signal(false);

  constructor(public auth: AuthService, private router: Router) {}

  toggle() {
    this.collapsed.update(v => !v);
  }

  close() {
    this.collapsed.set(true);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.close();
  }
}
