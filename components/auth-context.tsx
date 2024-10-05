"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Admin = {
    id: string;
    username: string;
    assign_date: string;
    email: string;
    role: string;
    created_at: string;
}

interface AuthContextType {
    admin: Admin | null;
    setAdmin: (admin: Admin) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [adminData, setAdminData] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
            setAdminData(JSON.parse(storedAdmin));
        }
        setIsLoading(false);
    }, []);

    const setAdmin = (admin: Admin) => {
        setAdminData(admin);
        localStorage.setItem('admin', JSON.stringify(admin));
    }

    const logout = () => {
        setAdminData(null);
        localStorage.removeItem('admin');
    };

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ admin: adminData, setAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};