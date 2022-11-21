import { writable } from 'svelte/store';
import { GameTournaments } from './config';

export const storeCurrentPage = writable('Home');
export const storeLoggedUID = writable({});
export const storeTournament = writable(GameTournaments.WorldCup2022);
export const storeTournaments = writable([]);
export const storeParticipants = writable({});

export const storeLeaderboard = writable({})
export const storeCountScorePlusWin = writable({})
export const storeCountWins = writable({})
export const storeCountLost = writable({})
export const storeMatchScorePlusWin = writable({})
export const storeMatchWin = writable({})
export const storeMatchLoss = writable({})
export const storeTotalPredicts = writable({})
export const storeAllGames = writable([])
export const storeUpcomingGames = writable([])
export const storeSortedLeaderNames = writable([])