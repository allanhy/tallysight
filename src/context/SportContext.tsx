// SportContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SportContextType {
    selectedSport: string;
    setSelectedSport: (sport: string) => void;
    carouselSport: string;
    setCarouselSport: (sport: string) => void;
    selectedSoccerLeague: string;
    setSelectedSoccerLeague: (league: string) => void;
}

const SportContext = createContext<SportContextType | undefined>(undefined);

export const SportProvider = ({ children }: { children: ReactNode }) => {
    const [selectedSport, setSelectedSport] = useState<string>('NBA');
    const [carouselSport, setCarouselSport] = useState<string>('NBA');
    const [selectedSoccerLeague, setSelectedSoccerLeague] = useState<string>(''); 

    return (
        <SportContext.Provider value={{ selectedSport, setSelectedSport, carouselSport, setCarouselSport, selectedSoccerLeague, setSelectedSoccerLeague }}>
            {children}
        </SportContext.Provider>
    );
};

export const useSport = (): SportContextType => {
    const context = useContext(SportContext);
    if (!context) {
        throw new Error('useSport must be used within a SportProvider');
    }
    return context;
};
