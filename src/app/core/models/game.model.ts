export interface Participant {
  id: number;
  gameId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  joinedAt: string;
  position: number;
  hasPaymentProof: boolean;
  paymentProofUrl: string | null;
  rejectionReason: string | null;
}

export interface TeamPlayer {
  userId: number;
  userName: string;
}

export interface Team {
  id: number;
  teamNumber: number;
  name: string;
  players: TeamPlayer[];
}

export interface Game {
  id: number;
  gameDate: string;
  gameTime: string;
  location: string;
  courtId?: number | null;
  courtName?: string | null;
  pricePerPerson: number;
  maxPlayers: number;
  status: string;
  statusLabel: string;
  confirmedCount: number;
  waitingCount: number;
  availableSpots: number;
  createdAt: string;
  createdByName: string;
  confirmed: Participant[];
  waiting: Participant[];
  teams: Team[];
  myStatus?: string | null;
  myPosition?: number | null;
}

export interface CreateGameDto {
  gameDate: string;
  gameTime: string;
  courtId?: number;
  location?: string;
  pricePerPerson: number;
  maxPlayers: number;
}
