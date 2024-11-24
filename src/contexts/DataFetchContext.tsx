import { MajorTypes } from '@/types/type';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataFetchCtxProps {
    data: MajorTypes[] | undefined | null,
    fetchData: () => Promise<void>
}

const DataFetchCtx = createContext<DataFetchCtxProps | undefined | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<MajorTypes[] | null>();

    const fetchData = async () => {
        try {
            const response = await fetch('https://maramowicz.dev/azapi/database.json');
            if (!response.ok) throw new Error("Failed to fetch data");
            const jsonData: MajorTypes[] = await response.json();
            const filteredData = jsonData.filter((major: MajorTypes) => {
                return major.doc_type !== -1 && major.doc_type !== -2;
            });
            setData(filteredData);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DataFetchCtx.Provider value={{ data, fetchData }}>
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
