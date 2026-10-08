export type ElectionStatus = 'UPCOMING' | 'VOTING_ACTIVE' | 'VOTING_CLOSED' | 'RESULTS_DECLARED';

export interface ElectionPost {
  id: string;
  nameHi: string;
  nameEn: string;
  nameOr: string;
  order: number;
}

export interface Candidate {
  id: string;
  name: string;
  postId: string;
  panel: string; // e.g. "एकता परिवहन मोर्चा"
  symbol: string; // e.g. "🚚", "⚖️", "⚙️", "🌟", "🛡️"
  photoUrl?: string;
  truckNumber?: string;
  votes: number;
  isWinner?: boolean;
}

export interface ElectionPanel {
  id: string;
  name: string;
  leader: string;
  symbol: string;
  color: string;
  slogan: string;
}

export interface VoteReceipt {
  voteId: string;
  timestamp: string;
  vehicleNumber: string;
  ownerMobile: string;
  membershipNumber?: string;
  ownerName?: string;
  trackingToken?: string;
  ballotHash: string;
  cycleId?: string;
}

export interface VoterAuditEntry {
  id: string;
  cycleId: string; // Scoped strictly to each election year / cycle
  voterName: string;
  vehicleNumber: string;
  membershipNumber: string;
  mobile: string;
  votedAt: string;
  trackingToken: string;
  // NOTE: Zero-Knowledge Privacy — candidate/party selection is strictly NEVER stored!
}

export interface WinnerCelebration {
  isActive: boolean;
  winningPanel: string;
  winnerMessage: string;
  winnerSubMessage: string;
  declaredBy: string;
  declaredAt: string;
  expiresAt: string; // ISO date string
  durationHours: number; // e.g. 24 for 1 day
  chiefWinnerName?: string;
  chiefWinnerPost?: string;
  chiefWinnerPhoto?: string;
}

export interface ElectionCycleInfo {
  id: string;
  title: string;
  term: string; // e.g. "2026 – 2028"
  year: string; // e.g. "2026"
  status: ElectionStatus;
  startDate?: string;
  endDate?: string;
  totalVotesCast: number;
  totalVotersRegistered: number;
  declaredDate?: string;
}

export interface ElectionState {
  id: string;
  title: string;
  term: string; // "2026 - 2028 (द्विवार्षिक चुनाव)"
  status: ElectionStatus;
  startDate: string;
  endDate: string;
  posts: ElectionPost[];
  candidates: Candidate[];
  panels: ElectionPanel[];
  totalVotersRegistered: number;
  totalVotesCast: number;
  votedMobiles: string[]; // Mobile numbers that have already cast vote
  votedVehicles: string[]; // Normalized vehicle numbers that have already cast vote
  votedMemberships?: string[]; // Membership numbers (1 Owner = 1 Vote across all their trucks)
  votedOwners?: string[]; // Normalized owner names
  cycleVoterRolls?: { [cycleId: string]: VoterAuditEntry[] }; // Per-cycle independent voter tracking logs
  archivedCycles?: ElectionCycleInfo[]; // Historical past election cycles
  receipts: { [key: string]: VoteReceipt };
  celebration: WinnerCelebration;
  lastUpdated: string;
}
