// nextjs-frontend/app/register-user/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { RegisterUserResponse } from '../../api/api';
import { useUser } from '../../contexts/UserContext'; // ✨ useUserフックをインポート
import { useRouter } from 'next/navigation'; // ✨ useRouterをインポート
import React from 'react';
import Link from 'next/link';

export default function RegisterUserPage(): React.JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<RegisterUserResponse | null>(null);
    const [displayError, setDisplayError] = useState<string | null>(null);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const phpApiUrl: string | undefined = process.env.NEXT_PUBLIC_PHP_API_URL;

    const { setRandomUserId } = useUser(); // ✨ useUserからsetRandomUserIdを取得
    const router = useRouter(); // ✨ useRouterを初期化

    // ページタイトルを設定
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.title = 'ユーザー登録 | 匿名掲示板';
        }
    }, []);

    const handleRegister = async (): Promise<void> => {
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
        } else if (!/\S+@\S+\.\S+/.test(email)) { // 簡易的なメール形式チェック
            setEmailError('メールアドレスの形式が正しくありません');
            hasError = true;
        }
        if (!password.trim()) {
            setPasswordError('パスワードを入力してください');
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError('パスワードは6文字以上で入力してください');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setLoading(true);
        setResponse(null);

        try {
            const apiEndpoint = `${phpApiUrl}/register_user.php`;
            console.log(`Calling API: ${apiEndpoint}`);

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

            let data: RegisterUserResponse;
            try {
                data = await res.json() as RegisterUserResponse;
            } catch (jsonError) {
                const errorText = await res.text();
                console.error("APIレスポンスのJSONパースエラー:", jsonError);
                console.error("RAWレスポンス:", errorText);
                throw new Error(`サーバーからの応答が不正です（HTTP Status: ${res.status}）。`);
            }

            setResponse(data);

            if (!res.ok || data.status === 'error') {
                switch (data.error_code) {
                    case 'INVALID_EMAIL_FORMAT':
                        setDisplayError('メールアドレスの形式が正しくありません。');
                        setEmailError('メールアドレスの形式が正しくありません。');
                        break;
                    case 'PASSWORD_TOO_SHORT':
                        setDisplayError('パスワードは6文字以上で入力してください。');
                        setPasswordError('パスワードは6文字以上で入力してください。');
                        break;
                    case 'EMAIL_ALREADY_EXISTS':
                        setDisplayError('このメールアドレスは既に登録されています。');
                        setEmailError('このメールアドレスは既に登録されています。');
                        break;
                    case 'DB_ERROR':
                        setDisplayError('データベースでエラーが発生しました。時間をおいて再度お試しください。');
                        break;
                    case 'METHOD_NOT_ALLOWED':
                        setDisplayError('不正なリクエストです。');
                        break;
                    case 'UNKNOWN_APP_ERROR':
                        setDisplayError(`ユーザー登録中に不明なエラーが発生しました: ${data.message}`);
                        break;
                    default:
                        setDisplayError(data.message || `不明なエラーが発生しました。HTTPステータス: ${res.status}`);
                        break;
                }
            } else {
                // ✨ 成功した場合の処理を更新
                if (data.randomUserId) {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('randomUserId', data.randomUserId); // localStorageに保存
                    }
                    setRandomUserId(data.randomUserId); // ✨ Contextの状態を更新
                    // ユーザー情報ページにリダイレクトすることもできます
                    router.push('/');
                }
            }

        } catch (e: unknown) {
            console.error("ユーザー登録エラー:", e);
            if (e instanceof Error) {
                setDisplayError(e.message);
            } else {
                setDisplayError("不明なエラーが発生しました。");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* ヘッダーカード */}
                <div className="bg-white rounded-t-2xl px-6 py-8 shadow-lg">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">ユーザー登録</h1>
                        <p className="text-gray-600 text-sm md:text-base">匿名掲示板にアカウントを作成</p>
                    </div>
                </div>

                {/* フォームカード */}
                <div className="bg-white rounded-b-2xl px-6 py-6 shadow-lg">
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                        {/* メールアドレス入力 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                メールアドレス
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="your@example.com"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                        emailError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError('');
                                    }}
                                />
                            </div>
                            {emailError && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
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
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    placeholder="6文字以上"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                        passwordError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (passwordError) setPasswordError('');
                                    }}
                                />
                            </div>
                            {passwordError && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* 登録ボタン */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    登録中...
                                </div>
                            ) : (
                                '新しい匿名ユーザーとして登録'
                            )}
                        </button>

                        {/* エラーメッセージ */}
                        {displayError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-700 text-sm">{displayError}</p>
                                </div>
                            </div>
                        )}

                        {/* 成功時のレスポンス表示（エラー時のみ表示） */}
                        {response && response.status === 'error' && !displayError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-red-700 font-medium">APIからエラーが返されました</p>
                                        <p className="text-red-600 text-sm">{response.message}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* ログインリンク */}
                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600 text-sm mb-2">既にアカウントをお持ちですか？</p>
                        <Link 
                            href="/login-user" 
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            ログインする
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}