import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    @if (auth.isLoggedIn()) {
      <app-navbar />
    }
    <router-outlet />
  `,
  styles: []
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
