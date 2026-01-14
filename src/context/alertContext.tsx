import React, { createContext, useContext, useState, ReactNode } from 'react';
import {AlertSeverity} from "@/src/types/alertComponent";
import {AlertData, AlertContextType} from "@/src/interfaces/alertComponent";

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alert, setAlert] = useState<AlertData | null>(null);

    const showAlert = (message: string, severity: AlertSeverity = 'info') => {
        setAlert({ message, severity });

        setTimeout(() => {
            setAlert(null);
        }, 3000);
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = (): AlertContextType => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
