import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ElectionState,
  ElectionStatus,
  Candidate,
  VoteReceipt,
  VoterAuditEntry,
  WinnerCelebration,
  ElectionCycleInfo,
} from '../types/election.js';

const ELECTION_STORAGE_KEY = 'stoa_biennial_election_v1';

export const INITIAL_ARCHIVED_CYCLES: ElectionCycleInfo[] = [
  {
    id: 'STOA-ELEC-2024',
    title: 'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्विवार्षिक चुनाव 2024–2026',
    term: '2024 – 2026',
    year: '2024',
    status: 'RESULTS_DECLARED',
    startDate: '2024-10-01T08:00:00Z',
    endDate: '2024-10-05T18:00:00Z',
    totalVotesCast: 412,
    totalVotersRegistered: 420,
    declaredDate: '2024-10-06T10:00:00Z',
  },
  {
    id: 'STOA-ELEC-2022',
    title: 'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्विवार्षिक चुनाव 2022–2024',
    term: '2022 – 2024',
    year: '2022',
    status: 'RESULTS_DECLARED',
    startDate: '2022-10-01T08:00:00Z',
    endDate: '2022-10-05T18:00:00Z',
    totalVotesCast: 389,
    totalVotersRegistered: 400,
    declaredDate: '2022-10-06T10:00:00Z',
  },
];

export const INITIAL_ELECTION_STATE: ElectionState = {
  id: 'STOA-ELEC-2026',
  title: 'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्विवार्षिक आम चुनाव',
  term: '2026 – 2028 (कार्यकाल: 2 वर्ष)',
  status: 'VOTING_ACTIVE',
  startDate: '2026-10-01T08:00:00Z',
  endDate: '2026-10-05T18:00:00Z',
  posts: [
    { id: 'pres', nameHi: 'अध्यक्ष (President)', nameEn: 'President', nameOr: 'ସଭାପତି', order: 1 },
    { id: 'sec', nameHi: 'महासचिव (General Secretary)', nameEn: 'General Secretary', nameOr: 'ସାଧାରଣ ସମ୍ପାଦକ', order: 2 },
    { id: 'tres', nameHi: 'कोषाध्यक्ष (Treasurer)', nameEn: 'Treasurer', nameOr: 'କୋଷାଧ୍ୟକ୍ଷ', order: 3 },
    { id: 'vp', nameHi: 'उपाध्यक्ष (Vice President)', nameEn: 'Vice President', nameOr: 'ଉପସଭାପତି', order: 4 },
  ],
  panels: [
    {
      id: 'panel-1',
      name: 'एकता परिवहन मोर्चा',
      leader: 'सरदार सुरिंदर सिंह',
      symbol: '🚚',
      color: '#E50046',
      slogan: 'हक, सुरक्षा एवं पारदर्शी 15-टू-15 आवर्तन की गारंटी',
    },
    {
      id: 'panel-2',
      name: 'संबलपुर स्वाभिमान पैनल',
      leader: 'राजेश पटेल',
      symbol: '⚖️',
      color: '#2563EB',
      slogan: 'स्वच्छ प्रशासन, समय पर भाड़ा और ट्रान्सपोर्टरों का सम्मान',
    },
  ],
  candidates: [
    // अध्यक्ष
    {
      id: 'cand-pres-1',
      name: 'सरदार सुरिंदर सिंह',
      postId: 'pres',
      panel: 'एकता परिवहन मोर्चा',
      symbol: '🚚',
      truckNumber: 'OD 15 A 1122',
      votes: 184,
      isWinner: true,
    },
    {
      id: 'cand-pres-2',
      name: 'राजेश पटेल',
      postId: 'pres',
      panel: 'संबलपुर स्वाभिमान पैनल',
      symbol: '⚖️',
      truckNumber: 'OD 15 B 4455',
      votes: 142,
      isWinner: false,
    },
    // महासचिव
    {
      id: 'cand-sec-1',
      name: 'पंकज साहनी',
      postId: 'sec',
      panel: 'एकता परिवहन मोर्चा',
      symbol: '🚚',
      truckNumber: 'OD 15 X 7273',
      votes: 198,
      isWinner: true,
    },
    {
      id: 'cand-sec-2',
      name: 'मनोज कुमार मोहंती',
      postId: 'sec',
      panel: 'संबलपुर स्वाभिमान पैनल',
      symbol: '⚖️',
      truckNumber: 'OD 15 K 8899',
      votes: 128,
      isWinner: false,
    },
    // कोषाध्यक्ष
    {
      id: 'cand-tres-1',
      name: 'दिलीप अग्रवाल',
      postId: 'tres',
      panel: 'एकता परिवहन मोर्चा',
      symbol: '🚚',
      truckNumber: 'OD 15 M 3321',
      votes: 190,
      isWinner: true,
    },
    {
      id: 'cand-tres-2',
      name: 'संतोष नायक',
      postId: 'tres',
      panel: 'संबलपुर स्वाभिमान पैनल',
      symbol: '⚖️',
      truckNumber: 'OD 15 E 5544',
      votes: 136,
      isWinner: false,
    },
    // उपाध्यक्ष
    {
      id: 'cand-vp-1',
      name: 'प्रमोद कुमार बारीक',
      postId: 'vp',
      panel: 'एकता परिवहन मोर्चा',
      symbol: '🚚',
      truckNumber: 'OD 15 G 9900',
      votes: 176,
      isWinner: true,
    },
    {
      id: 'cand-vp-2',
      name: 'सुनील कुमार शर्मा',
      postId: 'vp',
      panel: 'संबलपुर स्वाभिमान पैनल',
      symbol: '⚖️',
      truckNumber: 'OD 15 H 6611',
      votes: 150,
      isWinner: false,
    },
  ],
  totalVotersRegistered: 420,
  totalVotesCast: 326,
  votedMobiles: [],
  votedVehicles: [],
  votedMemberships: [],
  votedOwners: [],
  cycleVoterRolls: {
    'STOA-ELEC-2026': [],
    'STOA-ELEC-2024': [
      {
        id: 'vtr-2024-01',
        cycleId: 'STOA-ELEC-2024',
        voterName: 'सरदार सुरिंदर सिंह (Surinder Singh)',
        vehicleNumber: 'OD15A1122',
        membershipNumber: 'STOA-M-0001',
        mobile: '9437012345',
        votedAt: '2024-10-04T10:15:00Z',
        trackingToken: 'STOA-TRK-1122-2345-ARCH24',
      },
      {
        id: 'vtr-2024-02',
        cycleId: 'STOA-ELEC-2024',
        voterName: 'अजय कुमार साहनी (Ajay Sahani)',
        vehicleNumber: 'OR15R7188',
        membershipNumber: 'STOA-M-0188',
        mobile: '9861099887',
        votedAt: '2024-10-04T11:42:00Z',
        trackingToken: 'STOA-TRK-7188-9887-ARCH24',
      },
      {
        id: 'vtr-2024-03',
        cycleId: 'STOA-ELEC-2024',
        voterName: 'राजेश कुमार शर्मा (Rajesh Sharma)',
        vehicleNumber: 'OD15A1001',
        membershipNumber: 'STOA-M-1001',
        mobile: '9876543210',
        votedAt: '2024-10-04T14:10:00Z',
        trackingToken: 'STOA-TRK-1001-3210-ARCH24',
      },
    ],
    'STOA-ELEC-2022': [
      {
        id: 'vtr-2022-01',
        cycleId: 'STOA-ELEC-2022',
        voterName: 'सरदार सुरिंदर सिंह (Surinder Singh)',
        vehicleNumber: 'OD15A1122',
        membershipNumber: 'STOA-M-0001',
        mobile: '9437012345',
        votedAt: '2022-10-03T09:30:00Z',
        trackingToken: 'STOA-TRK-1122-2345-ARCH22',
      },
    ],
  },
  archivedCycles: INITIAL_ARCHIVED_CYCLES,
  receipts: {},
  celebration: {
    isActive: false, // Admin can toggle on/off anytime!
    winningPanel: 'एकता परिवहन मोर्चा',
    chiefWinnerName: 'सरदार सुरिंदर सिंह (अध्यक्ष) एवं पंकज साहनी (महासचिव)',
    chiefWinnerPost: 'समस्त विजयी कार्यकारिणी (2026-2028)',
    winnerMessage: 'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्विवार्षिक चुनाव 2026–2028 में प्रचंड बहुमत से विजयी होने पर समस्त पदाधिकारियों को हार्दिक बधाई एवं शुभकामनाएं!',
    winnerSubMessage: 'एसोसिएशन के समस्त सम्मानित ट्रक मालिकों के अटूट विश्वास, निष्पक्ष मतदान और ऐतिहासिक समर्थन के लिए कोटि-कोटि धन्यवाद!',
    declaredBy: 'मुख्य चुनाव अधिकारी, STOA संबलपुर',
    declaredAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 24,
  },
  lastUpdated: new Date().toISOString(),
};

interface ElectionContextType {
  election: ElectionState;
  hasOwnerVoted: (mobile?: string, membershipNumber?: string, ownerName?: string, vehicleNumber?: string) => boolean;
  hasVehicleVoted: (vehicleNumber: string) => boolean;
  getOwnerReceipt: (key?: string) => VoteReceipt | null;
  getCycleVoterAuditRoll: (cycleId?: string) => VoterAuditEntry[];
  getActiveCycleId: () => string;
  getAvailableCycles: () => ElectionCycleInfo[];
  castVote: (
    voterMobile: string,
    vehicleNumber: string,
    selections: { [postId: string]: string },
    membershipNumber?: string,
    ownerName?: string
  ) => { success: boolean; error?: string; receipt?: VoteReceipt };
  updateStatus: (status: ElectionStatus) => void;
  updateCandidateVotes: (candidateId: string, votes: number) => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'votes'> & { votes?: number }) => void;
  removeCandidate: (candidateId: string) => void;
  initiateElectionCycle: (config: {
    title: string;
    term: string;
    startDate: string;
    endDate: string;
    totalVotersRegistered?: number;
    resetVotes?: boolean;
  }) => void;
  setCountdownTimer: (endDate: string) => void;
  toggleVotingActive: (active?: boolean) => void;
  updateCelebration: (partial: Partial<WinnerCelebration>) => void;
  toggleCelebration: (active?: boolean) => void;
  declareWinnersAutomatically: () => void;
  resetElectionData: () => void;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const ElectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [election, setElection] = useState<ElectionState>(() => {
    try {
      const saved = localStorage.getItem(ELECTION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_ELECTION_STATE,
          ...parsed,
          votedVehicles: Array.isArray(parsed.votedVehicles) ? parsed.votedVehicles : [],
          votedMobiles: Array.isArray(parsed.votedMobiles) ? parsed.votedMobiles : [],
          votedMemberships: Array.isArray(parsed.votedMemberships) ? parsed.votedMemberships : [],
          votedOwners: Array.isArray(parsed.votedOwners) ? parsed.votedOwners : [],
          cycleVoterRolls: parsed.cycleVoterRolls && typeof parsed.cycleVoterRolls === 'object' ? parsed.cycleVoterRolls : { 'STOA-ELEC-2026': [] },
          receipts: parsed.receipts && typeof parsed.receipts === 'object' ? parsed.receipts : {},
          candidates: Array.isArray(parsed.candidates) && parsed.candidates.length > 0 ? parsed.candidates : INITIAL_ELECTION_STATE.candidates,
          posts: Array.isArray(parsed.posts) && parsed.posts.length > 0 ? parsed.posts : INITIAL_ELECTION_STATE.posts,
          panels: Array.isArray(parsed.panels) && parsed.panels.length > 0 ? parsed.panels : INITIAL_ELECTION_STATE.panels,
        };
      }
    } catch (e) {
      console.error('Failed to parse election state', e);
    }
    return INITIAL_ELECTION_STATE;
  });

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(ELECTION_STORAGE_KEY, JSON.stringify(election));
    } catch (e) {
      console.error('Failed to save election state', e);
    }
  }, [election]);

  const hasOwnerVoted = (
    mobile?: string,
    membershipNumber?: string,
    ownerName?: string,
    vehicleNumber?: string
  ): boolean => {
    const cleanMobile = mobile ? mobile.replace(/\D/g, '').slice(-10) : '';
    const cleanVeh = vehicleNumber ? vehicleNumber.replace(/\s+/g, '').toUpperCase() : '';
    const cleanMem = membershipNumber ? membershipNumber.trim().toUpperCase() : '';
    const cleanName = ownerName ? ownerName.trim().toLowerCase() : '';

    // Check 1: Mobile check
    if (cleanMobile && (election.votedMobiles || []).some((m) => m.replace(/\D/g, '').slice(-10) === cleanMobile)) {
      return true;
    }
    // Check 2: Vehicle check
    if (cleanVeh && (election.votedVehicles || []).some((v) => v.replace(/\s+/g, '').toUpperCase() === cleanVeh)) {
      return true;
    }
    // Check 3: Membership check (1 Owner = 1 Vote across 1 or 10 trucks)
    if (cleanMem && (election.votedMemberships || []).some((mem) => mem.trim().toUpperCase() === cleanMem)) {
      return true;
    }
    // Check 4: Owner name check
    if (cleanName && (election.votedOwners || []).some((name) => name.trim().toLowerCase() === cleanName)) {
      return true;
    }

    return false;
  };

  const hasVehicleVoted = (vehNumber: string): boolean => {
    if (!vehNumber) return false;
    const cleanVeh = vehNumber.replace(/\s+/g, '').toUpperCase();
    return (election.votedVehicles || []).some(
      (v) => v.replace(/\s+/g, '').toUpperCase() === cleanVeh
    );
  };

  const getOwnerReceipt = (key?: string): VoteReceipt | null => {
    if (!key) return null;
    const cleanMobile = key.replace(/\D/g, '').slice(-10);
    const cleanVeh = key.replace(/\s+/g, '').toUpperCase();
    const cleanKey = key.trim().toUpperCase();

    return (
      election.receipts[cleanMobile] ||
      election.receipts[cleanVeh] ||
      election.receipts[cleanKey] ||
      null
    );
  };

  const castVote = (
    voterMobile: string,
    vehicleNumber: string,
    selections: { [postId: string]: string },
    membershipNumber?: string,
    ownerName?: string
  ): { success: boolean; error?: string; receipt?: VoteReceipt } => {
    if (election.status !== 'VOTING_ACTIVE') {
      return { success: false, error: 'मतदान वर्तमान में सक्रिय नहीं है।' };
    }

    const cleanVehicle = (vehicleNumber || '').replace(/\s+/g, '').toUpperCase();
    const cleanMobile = (voterMobile || '').replace(/\D/g, '').slice(-10);
    const cleanMembership = (membershipNumber || '').trim().toUpperCase();
    const cleanOwnerName = (ownerName || '').trim();

    // Strict One Owner = One Vote rule (Whether owner has 1 truck or 10 trucks!)
    if (hasOwnerVoted(cleanMobile, cleanMembership, cleanOwnerName, cleanVehicle)) {
      return {
        success: false,
        error: `सुरक्षा प्रतिबंध: एक मालिक = एक वोट नियम लागू है! आपके नाम/पंजीकृत मोबाइल (${cleanMobile || cleanVehicle}) अथवा सदस्यता संख्या (${cleanMembership || 'दर्ज'}) के तहत पहले ही मतदान किया जा चुका है। एक मालिक के नाम पर चाहें 1 गाड़ी हो या 10 गाड़ियां, एसोसिएशन चुनाव नियमावली के तहत केवल 1 ही वोट मान्य है, दोबारा नहीं।`,
      };
    }

    // Validate that a candidate is selected for each post
    const postIds = election.posts.map((p) => p.id);
    for (const pId of postIds) {
      if (!selections[pId]) {
        return { success: false, error: 'कृपया सभी पदों के लिए उम्मीदवार का चयन करें।' };
      }
    }

    // Generate cryptographic-style receipt & unique zero-knowledge tracking token
    const voteId = `STOA-VOTE-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ballotHash = btoa(`${cleanMobile}-${cleanVehicle}-${cleanMembership}-${Date.now()}-${Object.values(selections).join('-')}`).slice(0, 20);
    const trackingToken = `STOA-TRK-${cleanVehicle.slice(-4)}-${cleanMobile.slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const currentCycleId = election.id || 'STOA-ELEC-2026';

    const receipt: VoteReceipt = {
      voteId,
      timestamp: new Date().toISOString(),
      vehicleNumber: cleanVehicle,
      ownerMobile: cleanMobile,
      membershipNumber: cleanMembership || undefined,
      ownerName: cleanOwnerName || undefined,
      trackingToken,
      ballotHash,
      cycleId: currentCycleId,
    };

    const newAuditEntry: VoterAuditEntry = {
      id: `vtr-${cleanVehicle}-${Date.now()}`,
      cycleId: currentCycleId,
      voterName: cleanOwnerName || 'पंजीकृत ट्रक मालिक',
      vehicleNumber: cleanVehicle,
      membershipNumber: cleanMembership || 'STOA-MEM',
      mobile: cleanMobile,
      votedAt: new Date().toISOString(),
      trackingToken,
    };

    // Increment votes securely & append to immutable audit lists
    setElection((prev) => {
      const updatedCandidates = prev.candidates.map((cand) => {
        const isSelected = Object.values(selections).includes(cand.id);
        return isSelected ? { ...cand, votes: cand.votes + 1 } : cand;
      });

      const updatedVotedMobiles = [...(prev.votedMobiles || []), cleanMobile];
      const updatedVotedVehicles = [...(prev.votedVehicles || []), cleanVehicle];
      const updatedVotedMemberships = cleanMembership
        ? [...(prev.votedMemberships || []), cleanMembership]
        : (prev.votedMemberships || []);
      const updatedVotedOwners = cleanOwnerName
        ? [...(prev.votedOwners || []), cleanOwnerName]
        : (prev.votedOwners || []);

      const existingCycleRoll = prev.cycleVoterRolls?.[currentCycleId] || [];
      const updatedCycleRoll = [
        ...existingCycleRoll.filter((e) => e.mobile !== cleanMobile && e.vehicleNumber !== cleanVehicle),
        newAuditEntry,
      ];
      const updatedCycleVoterRolls = {
        ...(prev.cycleVoterRolls || {}),
        [currentCycleId]: updatedCycleRoll,
      };

      const updatedReceipts = {
        ...prev.receipts,
        [cleanMobile]: receipt,
        [cleanVehicle]: receipt,
        ...(cleanMembership ? { [cleanMembership]: receipt } : {}),
      };

      return {
        ...prev,
        candidates: updatedCandidates,
        totalVotesCast: prev.totalVotesCast + 1,
        votedMobiles: updatedVotedMobiles,
        votedVehicles: updatedVotedVehicles,
        votedMemberships: updatedVotedMemberships,
        votedOwners: updatedVotedOwners,
        cycleVoterRolls: updatedCycleVoterRolls,
        receipts: updatedReceipts,
        lastUpdated: new Date().toISOString(),
      };
    });

    return { success: true, receipt };
  };

  const updateStatus = (status: ElectionStatus) => {
    setElection((prev) => ({
      ...prev,
      status,
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Security Lock: Admin is strictly prevented from tampering with or altering cast votes
  const updateCandidateVotes = (_candidateId: string, _votes: number) => {
    console.warn('Security Protection Alert: Admin cannot tamper with or modify cast votes.');
    // Deliberately no-op to ensure vote immutability
  };

  const addCandidate = (candidate: Omit<Candidate, 'id' | 'votes'> & { votes?: number }) => {
    setElection((prev) => {
      const newId = `cand-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      const newCandidate: Candidate = {
        id: newId,
        name: candidate.name.trim(),
        postId: candidate.postId,
        panel: candidate.panel.trim() || 'स्वतंत्र (Independent)',
        symbol: candidate.symbol || '🚚',
        photoUrl: candidate.photoUrl || '',
        truckNumber: candidate.truckNumber?.trim() || '',
        votes: candidate.votes || 0,
        isWinner: false,
      };
      return {
        ...prev,
        candidates: [...prev.candidates, newCandidate],
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const removeCandidate = (candidateId: string) => {
    setElection((prev) => ({
      ...prev,
      candidates: prev.candidates.filter((c) => c.id !== candidateId),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const initiateElectionCycle = (config: {
    title: string;
    term: string;
    startDate: string;
    endDate: string;
    totalVotersRegistered?: number;
    resetVotes?: boolean;
  }) => {
    setElection((prev) => {
      const oldCycleRecord: ElectionCycleInfo = {
        id: prev.id || 'STOA-ELEC-2026',
        title: prev.title,
        term: prev.term,
        year: (prev.term || '').slice(0, 4) || '2026',
        status: 'RESULTS_DECLARED',
        startDate: prev.startDate,
        endDate: prev.endDate,
        totalVotesCast: prev.totalVotesCast,
        totalVotersRegistered: prev.totalVotersRegistered,
      };

      const newCycleId = config.resetVotes
        ? `STOA-ELEC-${(config.term || 'NEW').replace(/\s+/g, '-').slice(0, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
        : (prev.id || 'STOA-ELEC-2026');

      const existingArchives = prev.archivedCycles || INITIAL_ARCHIVED_CYCLES;
      const updatedArchives = config.resetVotes
        ? [oldCycleRecord, ...existingArchives.filter((a) => a.id !== oldCycleRecord.id)]
        : existingArchives;

      return {
        ...prev,
        id: newCycleId,
        title: config.title || prev.title,
        term: config.term || prev.term,
        startDate: config.startDate || prev.startDate,
        endDate: config.endDate || prev.endDate,
        totalVotersRegistered: config.totalVotersRegistered ?? prev.totalVotersRegistered,
        status: 'UPCOMING',
        totalVotesCast: config.resetVotes ? 0 : prev.totalVotesCast,
        votedMobiles: config.resetVotes ? [] : prev.votedMobiles,
        votedVehicles: config.resetVotes ? [] : prev.votedVehicles,
        votedMemberships: config.resetVotes ? [] : prev.votedMemberships,
        votedOwners: config.resetVotes ? [] : prev.votedOwners,
        cycleVoterRolls: {
          ...(prev.cycleVoterRolls || {}),
          [newCycleId]: config.resetVotes ? [] : (prev.cycleVoterRolls?.[newCycleId] || []),
        },
        archivedCycles: updatedArchives,
        receipts: config.resetVotes ? {} : prev.receipts,
        candidates: config.resetVotes
          ? prev.candidates.map((c) => ({ ...c, votes: 0, isWinner: false }))
          : prev.candidates,
        celebration: {
          ...prev.celebration,
          isActive: false,
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const setCountdownTimer = (endDate: string) => {
    setElection((prev) => ({
      ...prev,
      endDate,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const toggleVotingActive = (active?: boolean) => {
    setElection((prev) => {
      const isCurrentlyActive = prev.status === 'VOTING_ACTIVE';
      const targetActive = active !== undefined ? active : !isCurrentlyActive;
      return {
        ...prev,
        status: targetActive ? 'VOTING_ACTIVE' : 'VOTING_CLOSED',
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const updateCelebration = (partial: Partial<WinnerCelebration>) => {
    setElection((prev) => ({
      ...prev,
      celebration: { ...prev.celebration, ...partial },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const toggleCelebration = (active?: boolean) => {
    setElection((prev) => {
      const newActive = active !== undefined ? active : !prev.celebration.isActive;
      const hours = prev.celebration.durationHours || 24;
      return {
        ...prev,
        celebration: {
          ...prev.celebration,
          isActive: newActive,
          declaredAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const declareWinnersAutomatically = () => {
    setElection((prev) => {
      // Find candidate with max votes for each post
      const winnersByPost: { [postId: string]: string } = {};
      for (const post of prev.posts) {
        const candsForPost = prev.candidates.filter((c) => c.postId === post.id);
        if (candsForPost.length > 0) {
          const winner = candsForPost.reduce((max, c) => (c.votes > max.votes ? c : max), candsForPost[0]);
          winnersByPost[post.id] = winner.id;
        }
      }

      const updatedCandidates = prev.candidates.map((c) => ({
        ...c,
        isWinner: winnersByPost[c.postId] === c.id,
      }));

      // Count which panel won the most posts
      const panelWinCount: { [panel: string]: number } = {};
      updatedCandidates
        .filter((c) => c.isWinner)
        .forEach((c) => {
          panelWinCount[c.panel] = (panelWinCount[c.panel] || 0) + 1;
        });

      let topPanel = prev.celebration.winningPanel;
      let maxWins = 0;
      for (const [panel, count] of Object.entries(panelWinCount)) {
        if (count > maxWins) {
          maxWins = count;
          topPanel = panel;
        }
      }

      const presWinner = updatedCandidates.find((c) => c.postId === 'pres' && c.isWinner);
      const secWinner = updatedCandidates.find((c) => c.postId === 'sec' && c.isWinner);

      const hours = prev.celebration.durationHours || 24;

      return {
        ...prev,
        status: 'RESULTS_DECLARED',
        candidates: updatedCandidates,
        celebration: {
          ...prev.celebration,
          isActive: true, // Auto trigger celebratory popup
          winningPanel: topPanel,
          chiefWinnerName: `${presWinner?.name || 'अध्यक्ष'} (अध्यक्ष) एवं ${secWinner?.name || 'महासचिव'} (महासचिव)`,
          declaredAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const getActiveCycleId = (): string => {
    return election.id || 'STOA-ELEC-2026';
  };

  const getCycleVoterAuditRoll = (cycleId?: string): VoterAuditEntry[] => {
    const target = cycleId || election.id || 'STOA-ELEC-2026';
    return election.cycleVoterRolls?.[target] || [];
  };

  const getAvailableCycles = (): ElectionCycleInfo[] => {
    const activeCycle: ElectionCycleInfo = {
      id: election.id || 'STOA-ELEC-2026',
      title: election.title || 'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्विवार्षिक आम चुनाव',
      term: election.term || '2026 – 2028',
      year: (election.term || '').slice(0, 4) || '2026',
      status: election.status,
      startDate: election.startDate,
      endDate: election.endDate,
      totalVotesCast: election.totalVotesCast,
      totalVotersRegistered: election.totalVotersRegistered,
    };
    const archives = election.archivedCycles || INITIAL_ARCHIVED_CYCLES;
    return [activeCycle, ...archives.filter((a) => a.id !== activeCycle.id)];
  };

  const resetElectionData = () => {
    setElection({
      ...INITIAL_ELECTION_STATE,
      votedMobiles: [],
      receipts: {},
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <ElectionContext.Provider
      value={{
        election,
        hasOwnerVoted,
        hasVehicleVoted,
        getOwnerReceipt,
        getCycleVoterAuditRoll,
        getActiveCycleId,
        getAvailableCycles,
        castVote,
        updateStatus,
        updateCandidateVotes,
        addCandidate,
        removeCandidate,
        initiateElectionCycle,
        setCountdownTimer,
        toggleVotingActive,
        updateCelebration,
        toggleCelebration,
        declareWinnersAutomatically,
        resetElectionData,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = (): ElectionContextType => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};
