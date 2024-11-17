import { MajorTypes } from '@/types/type';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataFetchCtxProps {
    data: MajorTypes[] | undefined | null,
    setData: React.Dispatch<React.SetStateAction<MajorTypes[] | undefined | null>>
}

const DataFetchCtx = createContext<DataFetchCtxProps | undefined | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<MajorTypes[] | null>();

    return (
        <DataFetchCtx.Provider value={{ data, setData }}>
            {children}
        </DataFetchCtx.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataFetchCtx);
    if (!context) {
        throw new Error('useData musi zostać użyte w DataProvider');
    }
    return context;
};
