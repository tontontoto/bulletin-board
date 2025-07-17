// nextjs-frontend/app/register-user/page.tsx
"use client";

import { useState } from 'react';
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
                    localStorage.setItem('randomUserId', data.randomUserId); // localStorageに保存
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
        <div className='flex flex-col w-[80%] shadow-black-500 shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-xl p-8 mx-auto my-10 bg-white items-center justify-center'>
            <h1 className='text-2xl font-bold mb-4'>匿名ユーザー登録</h1>

            {/* メールアドレス、パスワードの入力部分は変更なし */}
            <div className='flex flex-col gap-4 mb-4 w-full'>
                <div>
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        className={`border p-2 w-full rounded-xl ${emailError ? 'border-red-500' : ''}`}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                        }}
                    />
                    {emailError && (
                        <p className="text-red-500 text-sm mt-1">{emailError}</p>
                    )}
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="パスワード"
                        className={`border p-2 w-full rounded-xl ${passwordError ? 'border-red-500' : ''}`}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                        }}
                    />
                    {passwordError && (
                        <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                    )}
                </div>
            </div>

            <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    backgroundColor: loading ? '#ccc' : '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                }}
            >
                {loading ? '登録中...' : '新しい匿名ユーザーとして登録'}
            </button>

            <div className='flex flex-col items-center center justify-center mt-4'>
                <p>ユーザーをお持ちですか?</p>
                <Link href="/login-user" style={{ textDecoration: 'none', color: '#0070f3' }}>
                    ログイン
                </Link>
            </div>

            {/* {displayError && (
                <div style={{
                    marginTop: '20px',
                    color: 'red',
                    border: '1px solid red',
                    padding: '10px',
                    borderRadius: '5px'
                }}>
                    <h2>重要！</h2>
                    <p>{displayError}</p>
                </div>
            )} */}
            {/* 
            {response && response.status === 'success' && (
                <div style={{
                    marginTop: '20px',
                    backgroundColor: '#e6ffe6',
                    border: '1px solid #00cc00',
                    padding: '10px',
                    borderRadius: '5px'
                }}>
                    <h2>登録成功！ 🎉</h2>
                    <p>メッセージ: {response.message}</p>
                    {response.randomUserId && (
                        <p>あなたの匿名ID: <strong>{response.randomUserId}</strong></p>
                    )}
                    <p>この匿名IDは、今後の掲示板投稿などで他ユーザに表示されるよー</p>
                </div>
            )} */}

            {response && response.status === 'error' && !displayError && (
                <div style={{
                    marginTop: '20px',
                    color: 'red',
                    border: '1px solid red',
                    padding: '10px',
                    borderRadius: '5px'
                }}>
                    <h2>APIからエラーが返されました！</h2>
                    <p>メッセージ: {response.message}</p>
                </div>
            )}

        </div>
    );
}