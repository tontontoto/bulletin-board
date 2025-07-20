// nextjs-frontend/components/Header.tsx
"use client"; // Client Componentであることを明示

import React from 'react';
import Link from 'next/link';
import { useUser } from '../contexts/UserContext'; // ✨ useUserフックをインポート

export default function Header(): React.JSX.Element {
    const { randomUserId, isLoadingUser, setRandomUserId } = useUser();

    // ログアウト処理
    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('randomUserId'); // localStorageから削除
        }
        setRandomUserId(null); // Contextの状態もクリア
        // 必要であれば、ログアウト後にトップページなどにリダイレクト
    };

    return (
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center px-3 md:px-8 py-2 md:py-5 space-y-2 md:space-y-0">
                {/* ロゴ部分 */}
                <div className="w-full md:w-auto text-center md:text-left">
                    <Link href="/" className="group inline-flex items-center no-underline text-white hover:text-blue-100 transition-all duration-200">
                        <span className="text-lg md:text-2xl font-bold">匿名掲示板</span>
                    </Link>
                </div>

                {/* ナビゲーション部分 */}
                <nav className="w-full md:w-auto">
                    {isLoadingUser ? (
                        // ユーザー情報をロード中
                        <div className="text-center md:text-right">
                            <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                <span className="text-white text-xs md:text-base">ロード中...</span>
                            </div>
                        </div>
                    ) : randomUserId ? (
                        // 匿名IDがある場合（登録済み）
                        <div className="flex flex-row md:flex-row items-center gap-3 md:gap-4 text-center md:text-right">
                            {/* ユーザーID表示 */}
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <span className="text-black text-sm md:text-base font-medium">
                                    <span className="block md:inline opacity-80">匿名ID:</span>
                                    <span className="block md:inline font-mono text-xs md:text-sm mt-1 md:mt-0 md:ml-2">
                                        {/* モバイルでは短縮表示 */}
                                        <span className="md:hidden">{randomUserId}</span>
                                        <span className="hidden md:inline">{randomUserId}</span>
                                    </span>
                                </span>
                            </div>
                            
                            {/* ボタングループ */}
                            <div className="flex gap-2 md:gap-3">
                                <Link 
                                    href="/user-info" 
                                    className="inline-flex items-center no-underline bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-black text-sm md:text-base px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    ユーザー情報
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm md:text-base font-medium cursor-pointer transition-all duration-200 hover:scale-105 shadow-md"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    ログアウト
                                </button>
                            </div>
                        </div>
                    ) : (
                        // 匿名IDがない場合（未登録）
                        <div className="text-center md:text-right">
                            <Link 
                                href="/register-user" 
                                className="inline-flex items-center no-underline bg-white text-blue-600 hover:bg-blue-50 text-sm md:text-base px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-md"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                ユーザー登録
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}