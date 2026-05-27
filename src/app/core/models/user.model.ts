export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  cpfNormalized?: string | null;
  createdAt?: string;
  totalGames?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterDto {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface HistoryItem {
  id: number;
  gameId: number;
  gameDate: string;
  gameTime: string;
  location: string;
  status: string;
  statusLabel: string;
  signedUpAt: string;
}
