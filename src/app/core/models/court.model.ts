export interface Court {
  id: number;
  name: string;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCourtDto {
  name: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface UpdateCourtDto {
  name: string;
  address?: string;
  city?: string;
  notes?: string;
}
