import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginDto, RegisterDto, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

export const API_URL = environment.apiUrl;
export const HUB_URL = environment.hubUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'squadza_token';
  private readonly USER_KEY = 'squadza_user';

  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  register(dto: RegisterDto) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, dto).pipe(
      tap(res => this.storeSession(res))
    );
  }

  login(dto: LoginDto) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, dto).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser()?.isAdmin ?? false;
  }

  private storeSession(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
