// nextjs-frontend/app/user-info/page.tsx
"use client"; // Client Componentであることを明示

import { useEffect, useState } from 'react'; // ✨ useState を追加
import { useRouter } from 'next/navigation';
import { useUser } from '../../contexts/UserContext';
import type { GetUserEmailResponse } from '../../api/api'; // ✨ GetUserEmailResponse をインポート
import React from 'react';
export default function UserInfoPage(): React.JSX.Element {
    const { randomUserId, isLoadingUser } = useUser();
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userRegisteredAt, setUserRegisteredAt] = useState<string | null>(null);
    const [fetchingDetails, setFetchingDetails] = useState<boolean>(true);

    const phpApiUrl: string | undefined = process.env.NEXT_PUBLIC_PHP_API_URL;

    // ページタイトルを設定
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.title = 'ユーザー情報 | 匿名掲示板';
        }
    }, []);

    // randomUserId がない場合（未ログイン状態）は登録ページへリダイレクト
    useEffect(() => {
        if (!isLoadingUser && !randomUserId) {
            router.push('/register-user');
        }
    }, [randomUserId, isLoadingUser, router]);

    // 匿名IDがある場合に、メールアドレスと登録日を取得
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!randomUserId || !phpApiUrl) {
                setFetchingDetails(false);
                return;
            }

            setFetchingDetails(true);
            try {
                const apiEndpoint = `${phpApiUrl}/get_user_email.php?random_user_id=${randomUserId}`;
                const res: Response = await fetch(apiEndpoint);
                const data: GetUserEmailResponse = await res.json() as GetUserEmailResponse;

                if (res.ok && data.status === 'success' && data.email && data.registeredAt) {
                    setUserEmail(data.email);
                    const date = new Date(data.registeredAt);
                    const formattedDate = date.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    setUserRegisteredAt(formattedDate);
                } else {
                    console.warn("ユーザー詳細情報の取得に失敗しました:", data.message || data.error_code);
                    setUserEmail(null);
                    setUserRegisteredAt(null);
                }
            } catch (e: unknown) {
                console.error("ユーザー詳細情報取得エラー:", e);
                setUserEmail(null);
                setUserRegisteredAt(null);
            } finally {
                setFetchingDetails(false);
            }
        };

        // randomUserId が存在し、かつまだ詳細情報を取得していない場合にのみ実行
        if (randomUserId && !userEmail && fetchingDetails) { // fetchingDetails の初期値がtrueなので、初回のみ実行される
            fetchUserDetails();
        }
    }, [randomUserId, phpApiUrl, userEmail, fetchingDetails]); // 依存配列に userEmail と fetchingDetails を追加

    // 全体のロード状態（UserContextのロード + 詳細情報取得のロード）
    if (isLoadingUser || fetchingDetails) {
        return (
            <div className='flex flex-col w-[95%] sm:w-[85%] lg:w-[70%] xl:w-[60%] max-w-2xl shadow-lg rounded-xl p-4 sm:p-6 lg:p-8 mx-auto my-4 sm:my-6 lg:my-10 bg-white items-center justify-center'>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className='text-lg sm:text-xl text-gray-700 text-center'>ユーザー情報を読み込み中...</p>
            </div>
        );
    }

    // randomUserId がない場合（リダイレクトされるはずだが、念のため）
    if (!randomUserId) {
        return (
            <div className='flex flex-col w-[95%] sm:w-[85%] lg:w-[70%] xl:w-[60%] max-w-2xl shadow-lg rounded-xl p-4 sm:p-6 lg:p-8 mx-auto my-4 sm:my-6 lg:my-10 bg-white items-center justify-center'>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 w-full">
                    <div className="flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h2 className="text-lg sm:text-xl font-semibold text-red-700">アクセスエラー</h2>
                    </div>
                    <p className='text-sm sm:text-base text-red-600 text-center'>匿名ユーザー情報が見つかりません。<br className="sm:hidden"/>登録またはログインしてください。</p>
                </div>
            </div>
        );
    }

    // randomUserId があり、詳細情報も取得できた場合の表示
    return (
        <div className='flex flex-col w-[95%] sm:w-[85%] lg:w-[70%] xl:w-[60%] max-w-2xl shadow-lg rounded-xl p-4 sm:p-6 lg:p-8 mx-auto my-4 sm:my-6 lg:my-10 bg-white'>
            {/* ヘッダー部分 */}
            <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>ユーザー情報</h1>
                <p className='text-sm sm:text-base text-gray-600 mt-2'>あなたのアカウント詳細</p>
            </div>

            {/* 情報カード */}
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 sm:p-6 w-full'>
                {/* 匿名ID */}
                <div className="mb-6">
                    <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h3 className='text-base sm:text-lg font-semibold text-gray-700'>匿名ID</h3>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                        <p className='text-sm sm:text-base lg:text-lg font-mono text-blue-700 break-all leading-relaxed'>
                            {randomUserId}
                        </p>
                    </div>
                </div>

                {/* メールアドレス */}
                {userEmail && (
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h3 className='text-base sm:text-lg font-semibold text-gray-700'>メールアドレス</h3>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                            <p className='text-sm sm:text-base lg:text-lg text-gray-800 break-all leading-relaxed'>
                                {userEmail}
                            </p>
                        </div>
                    </div>
                )}

                {/* 登録日 */}
                {userRegisteredAt && (
                    <div className="mb-4">
                        <div className="flex items-center mb-3">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className='text-base sm:text-lg font-semibold text-gray-700'>登録日</h3>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                            <p className='text-sm sm:text-base lg:text-lg text-gray-800 leading-relaxed'>
                                {userRegisteredAt}
                            </p>
                        </div>
                    </div>
                )}

                {/* エラー表示 */}
                {!userEmail && !userRegisteredAt && !fetchingDetails && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className='text-sm sm:text-base text-yellow-700'>
                                詳細情報の取得に失敗しました
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* フッター説明 */}
            <div className="mt-6 sm:mt-8 text-center">
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-700">匿名IDについて</h4>
                    </div>
                    <p className='text-xs sm:text-sm text-gray-600 leading-relaxed'>
                        このIDは、あなたの投稿を識別するために使用されます。<br className="hidden sm:inline"/>
                        個人情報は含まれておらず、安全に匿名で掲示板をご利用いただけます。
                    </p>
                </div>
            </div>
        </div>
    );
}