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
    // ✨ ユーザーのメールアドレスと登録日を保持するステートを追加
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userRegisteredAt, setUserRegisteredAt] = useState<string | null>(null);
    const [fetchingDetails, setFetchingDetails] = useState<boolean>(true); // 詳細情報取得中フラグ

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
                    // 日付のフォーマットを整形（例: YYYY年MM月DD日）
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
                    // エラーの場合もフラグをfalseにする
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
            <div className='flex flex-col w-[80%] shadow-black-500 shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-xl p-8 mx-auto my-10 bg-white items-center justify-center'>
                <p className='text-xl text-gray-700'>ユーザー情報を読み込み中...</p>
            </div>
        );
    }

    // randomUserId がない場合（リダイレクトされるはずだが、念のため）
    if (!randomUserId) {
        return (
            <div className='flex flex-col w-[80%] shadow-black-500 shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-xl p-8 mx-auto my-10 bg-white items-center justify-center'>
                <p className='text-xl text-red-500'>匿名ユーザー情報が見つかりません。登録またはログインしてください。</p>
            </div>
        );
    }

    // randomUserId があり、詳細情報も取得できた場合の表示
    return (
        <div className='flex flex-col w-[80%] shadow-black-500 shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-xl p-8 mx-auto my-10 bg-white items-center justify-center'>
            <h1 className='text-3xl font-bold mb-6 text-gray-800'>あなたのユーザー情報</h1>
            <div className='bg-blue-50 p-6 rounded-lg shadow-inner w-full max-w-md text-center'>
                <p className='text-lg text-gray-700 mb-2'>あなたの匿名ID:</p>
                <p className='text-2xl font-mono text-blue-700 break-all mb-4'>
                    <strong>{randomUserId}</strong>
                </p>
                {userEmail && ( // ✨ メールアドレスが表示可能なら表示
                    <p className='text-lg text-gray-700 mb-2'>メールアドレス:</p>
                )}
                {userEmail && (
                    <p className='text-xl font-semibold text-gray-800 break-all mb-4'>
                        {userEmail}
                    </p>
                )}
                {userRegisteredAt && ( // ✨ 登録日が表示可能なら表示
                    <p className='text-lg text-gray-700 mb-2'>登録日:</p>
                )}
                {userRegisteredAt && (
                    <p className='text-xl font-semibold text-gray-800'>
                        {userRegisteredAt}
                    </p>
                )}
                {!userEmail && !userRegisteredAt && !fetchingDetails && (
                    <p className='text-md text-red-500 mt-4'>
                        ユーザー詳細情報の取得に失敗しました。
                    </p>
                )}
            </div>
            <p className='text-md text-gray-600 mt-8 text-center'>
                このIDは、あなたの投稿を識別するために使用されます。
            </p>
        </div>
    );
}