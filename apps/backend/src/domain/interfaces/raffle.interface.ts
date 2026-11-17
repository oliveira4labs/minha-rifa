export type RaffleStatus = 'open' | 'drawn';

/** Datas em milissegundos (epoch). Valores em centavos. */
export interface Raffle {
  id: number;
  slug: string;
  userId: number;
  title: string;
  description: string;
  totalNumbers: number;
  priceCents: number;
  pixKey: string;
  whatsapp: string;
  reserveMinutes: number;
  maxPerBuyer: number | null;
  drawDate: number | null;
  status: RaffleStatus;
  winnerNumber: number | null;
  drawnAt: number | null;
  createdAt: number;
}

/** Campos que o administrador pode informar ao criar/editar. */
export interface RaffleDetails {
  title: string;
  description: string;
  totalNumbers: number;
  priceCents: number;
  pixKey: string;
  whatsapp: string;
  reserveMinutes: number;
  maxPerBuyer: number | null;
  drawDate: number | null;
}

export type NewRaffle = RaffleDetails & { slug: string; userId: number; createdAt: number };

export interface Photo {
  id: number;
  raffleId: number;
  filename: string;
  position: number;
}

/** Quantidade de números pagos e reservados (pendentes) de uma rifa. */
export interface NumberCounts {
  paid: number;
  pending: number;
}

/** Quantidade de números e valor: o que fica travado depois da primeira reserva. */
export type RafflePricing = Pick<Raffle, 'totalNumbers' | 'priceCents'>;
