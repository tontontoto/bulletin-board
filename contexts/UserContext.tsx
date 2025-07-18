// nextjs-frontend/contexts/UserContext.tsx
"use client"; // Context ProviderはClient Componentである必要がある

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// ユーザー情報の型定義
interface UserContextType {
    randomUserId: string | null;
    setRandomUserId: (id: string | null) => void;
    isLoadingUser: boolean; // ユーザー情報の読み込み中かどうか
}

// Contextの作成 (初期値はnullまたは未定義)
const UserContext = createContext<UserContextType | undefined>(undefined);

// Context Providerコンポーネント
interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
    const [randomUserId, setRandomUserId] = useState<string | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true); // 初期ロードはtrue

    // コンポーネントがマウントされたときにlocalStorageからユーザー情報を読み込む
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem('randomUserId');
            if (storedUserId) {
                setRandomUserId(storedUserId);
            }
        }
        setIsLoadingUser(false); // 読み込み完了
    }, []);

    return (
        <UserContext.Provider value={{ randomUserId, setRandomUserId, isLoadingUser }}>
            {children}
        </UserContext.Provider>
    );
}

// Contextを使用するためのカスタムフック
export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}