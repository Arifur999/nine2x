'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import OTTTabs from '@/components/OTTTabs';
import HeroSlider from '@/components/HeroSlider';
import StatsBar from '@/components/StatsBar';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import HomeRows from '@/components/HomeRows';
import BrowseView from '@/components/BrowseView';
import QuickViewModal from '@/components/QuickViewModal';
import FullViewModal from '@/components/FullViewModal';

export default function Home() {
  const { state, dispatch } = useApp();
  const [modalState, setModalState] = useState<{
    quickOpen: boolean;
    fullOpen: boolean;
    id: number | null;
    type: string;
  }>({
    quickOpen: false,
    fullOpen: false,
    id: null,
    type: 'movie',
  });

  const handleOpenQuick = (id: number, type: string) => {
    setModalState({
      quickOpen: true,
      fullOpen: false,
      id,
      type,
    });
  };

  const handleOpenFull = (id: number, type: string) => {
    setModalState({
      quickOpen: false,
      fullOpen: true,
      id,
      type,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({
      ...prev,
      quickOpen: false,
      fullOpen: false,
    }));
  };

  const handleSeeAll = (key: string, label: string) => {
    const map: Record<string, () => void> = {
      new_releases: () => {
        dispatch({ type: 'SET_MEDIA_TYPE', payload: 'movie' });
        dispatch({ type: 'SET_IS_SEARCH', payload: false });
        dispatch({ type: 'SET_FILTERS', payload: { genres: [], year: null, rating: null } });
        dispatch({ type: 'SET_LANG', payload: '' });
      },
      top_rated: () => {
        dispatch({ type: 'SET_MEDIA_TYPE', payload: 'movie' });
        dispatch({ type: 'SET_IS_SEARCH', payload: false });
        dispatch({ type: 'SET_FILTERS', payload: { genres: [], year: null, rating: null } });
        dispatch({ type: 'SET_LANG', payload: '' });
      },
      bengali: () => {
        dispatch({ type: 'SET_MEDIA_TYPE', payload: 'movie' });
        dispatch({ type: 'SET_LANG', payload: 'bn' });
        dispatch({ type: 'SET_IS_SEARCH', payload: false });
        dispatch({ type: 'SET_FILTERS', payload: { genres: [], year: null, rating: null } });
      },
      hindi: () => {
        dispatch({ type: 'SET_MEDIA_TYPE', payload: 'movie' });
        dispatch({ type: 'SET_LANG', payload: 'hi' });
        dispatch({ type: 'SET_IS_SEARCH', payload: false });
        dispatch({ type: 'SET_FILTERS', payload: { genres: [], year: null, rating: null } });
      },
      korean: () => {
        dispatch({ type: 'SET_MEDIA_TYPE', payload: 'tv' });
        dispatch({ type: 'SET_LANG', payload: 'ko' });
        dispatch({ type: 'SET_IS_SEARCH', payload: false });
        dispatch({ type: 'SET_FILTERS', payload: { genres: [], year: null, rating: null } });
      },
      action: () => {
        dispatch({ type: 'SET_MEDIA_TYPE', payload: 'movie' });
        dispatch({ type: 'SET_FILTERS', payload: { genres: ['28', '53'], year: null, rating: null } });
        dispatch({ type: 'SET_IS_SEARCH', payload: false });
        dispatch({ type: 'SET_LANG', payload: '' });
      },
      webseries: () => {
        dispatch({ type: 'SET_MEDIA_TYPE', payload: 'tv' });
        dispatch({ type: 'SET_LANG', payload: '' });
        dispatch({ type: 'SET_IS_SEARCH', payload: false });
        dispatch({ type: 'SET_FILTERS', payload: { genres: [], year: null, rating: null } });
      },
    };

    if (map[key]) map[key]();
    dispatch({
      type: 'SHOW_BROWSE',
      payload: { heading: label, icon: 'fa-th-large' },
    });
  };

  return (
    <div className='min-h-screen pb-16'>
      {/* Home View Sections */}
      {state.isHomeView && (
        <>
          <OTTTabs />
          <HeroSlider onOpenFull={handleOpenFull} onOpenQuick={handleOpenQuick} />
          <StatsBar />
          <ContinueWatchingRow onOpenFull={handleOpenFull} />
          <HomeRows onOpenQuick={handleOpenQuick} onSeeAll={handleSeeAll} />
        </>
      )}

      {/* Browse / Search / Watchlist View */}
      {state.isBrowseView && (
        <div className='pt-24'>
          <BrowseView onOpenQuick={handleOpenQuick} onOpenFull={handleOpenFull} />
        </div>
      )}

      {/* Modals */}
      <QuickViewModal
        isOpen={modalState.quickOpen}
        id={modalState.id}
        type={modalState.type}
        onClose={handleCloseModal}
        onOpenFull={handleOpenFull}
      />

      <FullViewModal
        isOpen={modalState.fullOpen}
        id={modalState.id}
        type={modalState.type}
        onClose={handleCloseModal}
        onOpenFull={handleOpenFull}
      />
    </div>
  );
}
