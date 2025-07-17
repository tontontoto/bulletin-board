// nextjs-frontend/components/Header.tsx
"use client"; // Client Componentであることを明示

import React from 'react';
import Link from 'next/link';
import { useUser } from '../contexts/UserContext'; // ✨ useUserフックをインポート

export default function Header(): React.JSX.Element {
    const { randomUserId, isLoadingUser, setRandomUserId } = useUser();

    // ログアウト処理
    const handleLogout = () => {
        localStorage.removeItem('randomUserId'); // localStorageから削除
        setRandomUserId(null); // Contextの状態もクリア
        // 必要であれば、ログアウト後にトップページなどにリダイレクト
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: '#f0f0f0',
            borderBottom: '1px solid #ddd'
        }}>
            <div>
                <Link href="/" style={{ textDecoration: 'none', color: '#333', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    匿名掲示板
                </Link>
            </div>
            <nav>
                {isLoadingUser ? (
                    // ユーザー情報をロード中
                    <span style={{ color: '#666' }}>ロード中...</span>
                ) : randomUserId ? (
                    // 匿名IDがある場合（登録済み）
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#0070f3' }}>
                            あなたの匿名ID: 
                            <span className='whitespace-nowrap'>{randomUserId}</span>
                        </span>
                        <Link href="/user-info" style={{ textDecoration: 'none', color: '#0070f3' }}>
                            ユーザー情報
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                border: '1px solid #ff4d4d',
                                color: '#ff4d4d',
                                padding: '0.5rem 1rem',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            ログアウト
                        </button>
                    </div>
                ) : (
                    // 匿名IDがない場合（未登録）
                    <Link href="/register-user" style={{ textDecoration: 'none', color: '#0070f3' }}>
                        ユーザー登録
                    </Link>
                )}
            </nav>
        </header>
    );
}