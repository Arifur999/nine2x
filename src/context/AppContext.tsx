'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { WatchlistItem, ContinueWatchItem, AppFilters, ViewMode, MediaType } from '@/lib/types';

// ─── State ────────────────────────────────────────────────────
interface AppState {
  mediaType: MediaType;
  page: number;
  lang: string;
  provider: string;
  region: string;
  query: string;
  isSearch: boolean;
  view: ViewMode;
  filters: AppFilters;
  isHomeView: boolean;
  isBrowseView: boolean;
  isWatchlistView: boolean;
  browseHeading: string;
  browseIcon: string;
  watchlist: WatchlistItem[];
  continueWatch: ContinueWatchItem[];
  searches: string[];
  activeServer: number;
  toast: { msg: string; type: 'success' | 'error' | 'info' } | null;
}

// ─── Actions ──────────────────────────────────────────────────
type Action =
  | { type: 'SET_MEDIA_TYPE'; payload: MediaType }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_LANG'; payload: string }
  | { type: 'SET_PROVIDER'; payload: { id: string; region: string } }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_IS_SEARCH'; payload: boolean }
  | { type: 'SET_VIEW'; payload: ViewMode }
  | { type: 'SET_FILTERS'; payload: AppFilters }
  | { type: 'SHOW_HOME' }
  | { type: 'SHOW_BROWSE'; payload: { heading: string; icon: string } }
  | { type: 'SHOW_WATCHLIST' }
  | { type: 'ADD_WATCHLIST'; payload: WatchlistItem }
  | { type: 'REMOVE_WATCHLIST'; payload: number }
  | { type: 'ADD_CONTINUE'; payload: ContinueWatchItem }
  | { type: 'REMOVE_CONTINUE'; payload: number }
  | { type: 'CLEAR_CONTINUE' }
  | { type: 'ADD_SEARCH'; payload: string }
  | { type: 'SET_ACTIVE_SERVER'; payload: number }
  | { type: 'SET_TOAST'; payload: AppState['toast'] }
  | { type: 'LOAD_PERSISTED'; payload: Partial<AppState> };

// ─── Initial State ────────────────────────────────────────────
const initialState: AppState = {
  mediaType: 'movie',
  page: 1,
  lang: '',
  provider: '',
  region: 'IN',
  query: '',
  isSearch: false,
  view: 'grid',
  filters: { genres: [], year: null, rating: null },
  isHomeView: true,
  isBrowseView: false,
  isWatchlistView: false,
  browseHeading: 'Trending',
  browseIcon: 'fa-fire',
  watchlist: [],
  continueWatch: [],
  searches: [],
  activeServer: 0,
  toast: null,
};

// ─── Reducer ──────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_PERSISTED':
      return { ...state, ...action.payload };
    case 'SET_MEDIA_TYPE':
      return { ...state, mediaType: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_LANG':
      return { ...state, lang: action.payload };
    case 'SET_PROVIDER':
      return { ...state, provider: action.payload.id, region: action.payload.region };
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_IS_SEARCH':
      return { ...state, isSearch: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SHOW_HOME':
      return {
        ...state,
        isHomeView: true,
        isBrowseView: false,
        isWatchlistView: false,
        query: '',
        mediaType: 'movie',
      };
    case 'SHOW_BROWSE':
      return {
        ...state,
        isHomeView: false,
        isBrowseView: true,
        isWatchlistView: false,
        browseHeading: action.payload.heading,
        browseIcon: action.payload.icon,
      };
    case 'SHOW_WATCHLIST':
      return {
        ...state,
        isHomeView: false,
        isBrowseView: true,
        isWatchlistView: true,
        browseHeading: 'My List',
        browseIcon: 'fa-heart',
      };
    case 'ADD_WATCHLIST':
      return { ...state, watchlist: [action.payload, ...state.watchlist] };
    case 'REMOVE_WATCHLIST':
      return { ...state, watchlist: state.watchlist.filter((w) => w.id !== action.payload) };
    case 'ADD_CONTINUE': {
      const filtered = state.continueWatch.filter((c) => c.id !== action.payload.id);
      return { ...state, continueWatch: [action.payload, ...filtered].slice(0, 12) };
    }
    case 'REMOVE_CONTINUE':
      return { ...state, continueWatch: state.continueWatch.filter((c) => c.id !== action.payload) };
    case 'CLEAR_CONTINUE':
      return { ...state, continueWatch: [] };
    case 'ADD_SEARCH': {
      const updated = [action.payload, ...state.searches.filter((s) => s !== action.payload)].slice(0, 8);
      return { ...state, searches: updated };
    }
    case 'SET_ACTIVE_SERVER':
      return { ...state, activeServer: action.payload };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const watchlist = JSON.parse(localStorage.getItem('pf_watchlist') || '[]');
      const searches = JSON.parse(localStorage.getItem('pf_searches') || '[]');
      const continueWatch = JSON.parse(localStorage.getItem('pf_continue') || '[]');
      dispatch({ type: 'LOAD_PERSISTED', payload: { watchlist, searches, continueWatch } });
    } catch {}
  }, []);

  // Persist watchlist, searches, continueWatch
  useEffect(() => {
    localStorage.setItem('pf_watchlist', JSON.stringify(state.watchlist));
  }, [state.watchlist]);

  useEffect(() => {
    localStorage.setItem('pf_searches', JSON.stringify(state.searches));
  }, [state.searches]);

  useEffect(() => {
    localStorage.setItem('pf_continue', JSON.stringify(state.continueWatch));
  }, [state.continueWatch]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Convenience hooks
export function useWatchlist() {
  const { state, dispatch } = useApp();
  const isInWatchlist = (id: number) => state.watchlist.some((w) => w.id === id);
  const toggle = (item: WatchlistItem) => {
    if (isInWatchlist(item.id)) {
      dispatch({ type: 'REMOVE_WATCHLIST', payload: item.id });
      return false;
    } else {
      dispatch({ type: 'ADD_WATCHLIST', payload: item });
      return true;
    }
  };
  return { watchlist: state.watchlist, isInWatchlist, toggle };
}

export function useToast() {
  const { dispatch } = useApp();
  return (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch({ type: 'SET_TOAST', payload: { msg, type } });
    setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2800);
  };
}
