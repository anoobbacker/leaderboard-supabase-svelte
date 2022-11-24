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


export const toasts = writable([])

export const dismissToast = (id) => {
  toasts.update((all) => all.filter((t) => t.id !== id))
}

export const addToast = (toast) => {
  // Create a unique ID so we can easily find/remove it
  // if it is dismissible/has a timeout.
  const id = Math.floor(Math.random() * 10000)

  // Setup some sensible defaults for a toast.
  const defaults = {
    id,
    type: 'info',
    dismissible: true,
    timeout: 3000,
  }

  // Push the toast to the top of the list of toasts
  const t = { ...defaults, ...toast }
  toasts.update((all) => [t, ...all])

  // If toast is dismissible, dismiss it after "timeout" amount of time.
  if (t.timeout) setTimeout(() => dismissToast(id), t.timeout)
}