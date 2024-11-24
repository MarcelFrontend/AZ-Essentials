import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface DevCtxProps {
    isDev: boolean;
    setIsDev: React.Dispatch<React.SetStateAction<boolean>>;
}

const DevCtx = createContext<DevCtxProps | undefined>(undefined);

export const DevProvider = ({ children }: { children: ReactNode }) => {
    const [isDev, setIsDev] = useState(false);
    useEffect(() => {
        const savedIsDev = sessionStorage.getItem("azIsDev")

        if (savedIsDev === "true") {
            setIsDev(true)
        }
    }, [])

    return (
        <DevCtx.Provider value={{ isDev, setIsDev }}>
            {children}
        </DevCtx.Provider>
    );
};

export const useDev = () => {
    const context = useContext(DevCtx);
    if (!context) {
        throw new Error('useDev must be used within a DevProvider');
    }
    return context;
};
