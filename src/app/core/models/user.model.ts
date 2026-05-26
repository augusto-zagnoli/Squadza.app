export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
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
  paymentStatus: string;
  paymentStatusLabel: string;
  hasProof: boolean;
  proofUrl: string | null;
  rejectionReason: string | null;
  teamNumber: number | null;
  joinedAt: string;
}
