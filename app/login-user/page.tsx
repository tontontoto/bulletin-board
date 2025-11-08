// nextjs-frontend/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { LoginResponse, GetUserEmailResponse } from '../../api/api'; // 型定義をインポート
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default function LoginPage(): React.JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [displayError, setDisplayError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const phpApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
    const { randomUserId, setRandomUserId, isLoadingUser } = useUser();
    const router = useRouter();

    // ページタイトルを設定
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.title = 'ログイン | 匿名掲示板';
        }
    }, []);

    // ページロード時にlocalStorageとDBをチェックしてメールアドレスを自動入力
    useEffect(() => {
        const fetchUserEmail = async () => {
            if (isLoadingUser || !phpApiUrl) {
                return; // ユーザー情報ロード中、またはAPI URLがない場合は何もしない
            }

            // もしランダムIDがlocalStorageにあり、まだメールアドレスが入力されていなければ
            if (randomUserId && !email) {
                setLoading(true);
                setDisplayError(null);
                try {
                    const apiEndpoint = `${phpApiUrl}/get_user_email.php?random_user_id=${randomUserId}`;
                    const res: Response = await fetch(apiEndpoint);
                    const data: GetUserEmailResponse = await res.json() as GetUserEmailResponse;

                    if (res.ok && data.status === 'success' && data.email) {
                        setEmail(data.email); // メールアドレスをinputのvalueに代入
                    } else {
                        // 匿名IDはあるが、メールアドレスが取得できない場合（例: DBに存在しない、エラーなど）
                        console.warn("匿名IDに対応するメールアドレスが見つかりませんでした:", data.message || data.error_code);
                        // localStorageの匿名IDをクリアして、再度登録を促すなどの対応も検討
                        // localStorage.removeItem('anonymousUserId');
                        // setAnonymousUserId(null);
                    }
                } catch (e: unknown) {
                    console.error("メールアドレス自動取得エラー:", e);
                    // エラーは表示しないが、コンソールにログ
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserEmail();
    }, [randomUserId, isLoadingUser, phpApiUrl, email]); // emailが変更された時も再実行されないように注意

    // 既にログイン済み（randomUserIdがある）なら、ユーザー情報ページにリダイレクト
    useEffect(() => {
        if (!isLoadingUser && randomUserId) {
            router.push('/');
        }
    }, [randomUserId, isLoadingUser, router]);


    const handleLogin = async (): Promise<void> => {
        if (!phpApiUrl) {
            setDisplayError("PHP APIのURLが設定されていません。開発者に連絡してください。");
            return;
        }

        // エラーメッセージをリセット
        setEmailError('');
        setPasswordError('');
        setDisplayError(null);

        // クライアントサイドでのバリデーション
        let hasError = false;
        if (!email.trim()) {
            setEmailError('メールアドレスを入力してください');
            hasError = true;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('メールアドレスの形式が正しくありません');
            hasError = true;
        }
        if (!password.trim()) {
            setPasswordError('パスワードを入力してください');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setLoading(true);

        try {
            const apiEndpoint = `${phpApiUrl}/login.php`; // ログインAPIのエンドポイント
            console.log(`Calling API: ${apiEndpoint}`);
            console.log('Request data:', { email: email, password: '[HIDDEN]' }); // パスワードは隠す

            const res: Response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            console.log('Response status:', res.status);
            console.log('Response ok:', res.ok);

            let data: LoginResponse;
            try {
                data = await res.json() as LoginResponse;
                console.log('Response data:', data);
            } catch (jsonError) {
                const errorText = await res.text();
                console.error("APIレスポンスのJSONパースエラー:", jsonError);
                console.error("RAWレスポンス:", errorText);
                throw new Error(`サーバーからの応答が不正です（HTTP Status: ${res.status}）。`);
            }

            if (!res.ok || data.status === 'error') {
                console.error('Login failed with error:', data.error_code, data.message);
                // PHPから返されたerror_codeに基づいて、日本語のエラーメッセージを設定
                switch (data.error_code) {
                    case 'MISSING_CREDENTIALS':
                        setDisplayError('メールアドレスとパスワードを入力してください。');
                        break;
                    case 'INVALID_CREDENTIALS':
                        setDisplayError('メールアドレスまたはパスワードが正しくありません。');
                        break;
                    case 'DB_ERROR':
                        setDisplayError(`データベースでエラーが発生しました。詳細: ${data.message || '不明なエラー'}。時間をおいて再度お試しください。`);
                        console.error('Database error details:', data);
                        break;
                    case 'METHOD_NOT_ALLOWED':
                        setDisplayError('不正なリクエストです。');
                        break;
                    case 'UNKNOWN_APP_ERROR':
                        setDisplayError(`ログイン中に不明なエラーが発生しました: ${data.message}`);
                        break;
                    default:
                        setDisplayError(data.message || `不明なエラーが発生しました。HTTPステータス: ${res.status}`);
                        break;
                }
            } else {
                // ログイン成功
                if (data.randomUserId) {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('randomUserId', data.randomUserId); // localStorageに保存
                    }
                    setRandomUserId(data.randomUserId); // Contextの状態を更新
                    router.push('/'); // ユーザー情報ページへリダイレクト
                }
            }

        } catch (e: unknown) {
            console.error("ログインエラー:", e);
            if (e instanceof Error) {
                setDisplayError(e.message);
            } else {
                setDisplayError("不明なエラーが発生しました。");
            }
        } finally {
            setLoading(false);
        }
    };

    // 既にログイン済みでリダイレクト中の場合は何も表示しない
    if (!isLoadingUser && randomUserId) {
        return <></>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* ヘッダーカード */}
                <div className="bg-white rounded-t-2xl px-6 py-8 shadow-lg">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">ログイン</h1>
                        <p className="text-gray-600 text-sm md:text-base">アカウントにアクセス</p>
                    </div>
                </div>

                {/* フォームカード */}
                <div className="bg-white rounded-b-2xl px-6 py-6 shadow-lg">
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        {/* メールアドレス入力 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700   mb-2">
                                メールアドレス
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="your@example.com"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all
                                        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                        placeholder:text-gray-500 dark:placeholder:text-gray-400
                                        ${emailError ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
                                    `}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError('');
                                    }}
                                />
                            </div>
                            {emailError && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {emailError}
                                </p>
                            )}
                        </div>

                        {/* パスワード入力 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                パスワード
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    placeholder="6文字以上"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all
                                        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                        placeholder:text-gray-500 dark:placeholder:text-gray-400
                                        ${passwordError ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
                                    `}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (passwordError) setPasswordError('');
                                    }}
                                />
                            </div>
                            {passwordError && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* ログインボタン */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    ログイン中...
                                </div>
                            ) : (
                                'ログイン'
                            )}
                        </button>

                        {/* エラーメッセージ */}
                        {displayError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-red-700 font-medium text-sm">ログインエラー</p>
                                        <p className="text-red-600 text-sm mt-1">{displayError}</p>
                                        <p className="text-red-600 text-xs mt-2">問題が解決しない場合は、管理者にお問い合わせください。</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* 登録リンク */}
                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600 text-sm mb-2">アカウントをお持ちでないですか？</p>
                        <Link 
                            href="/register-user" 
                            className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            新しいアカウントを作成
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}