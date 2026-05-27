export interface PublicSignupItem {
  id: number;
  name: string;
  status: string;
  position: number;
  signedUpAt: string;
}

export interface PublicGame {
  id: number;
  gameDate: string;
  gameTime: string;
  location: string;
  pricePerPerson: number;
  maxPlayers: number;
  status: string;
  confirmedCount: number;
  waitingCount: number;
  acceptingSignups: boolean;
  confirmed: PublicSignupItem[];
  waiting: PublicSignupItem[];
}
