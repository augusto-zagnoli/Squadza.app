import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/games', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'games',
    canActivate: [authGuard],
    loadComponent: () => import('./games/game-list/game-list.component').then(m => m.GameListComponent)
  },
  {
    path: 'games/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./games/game-detail/game-detail.component').then(m => m.GameDetailComponent)
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('./user/history/history.component').then(m => m.HistoryComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent)
  },
  {
    path: 'admin/create-game',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/create-game/create-game.component').then(m => m.CreateGameComponent)
  },
  { path: '**', redirectTo: '/games' }
];
