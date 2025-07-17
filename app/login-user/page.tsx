// nextjs-frontend/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { LoginResponse, GetUserEmailResponse } from '../../api/api'; // 型定義をインポート
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function LoginPage(): React.JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [displayError, setDisplayError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const phpApiUrl: string | undefined = process.env.NEXT_PUBLIC_PHP_API_URL;
    const { randomUserId, setRandomUserId, isLoadingUser } = useUser();
    const router = useRouter();

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

            let data: LoginResponse;
            try {
                data = await res.json() as LoginResponse;
            } catch (jsonError) {
                const errorText = await res.text();
                console.error("APIレスポンスのJSONパースエラー:", jsonError);
                console.error("RAWレスポンス:", errorText);
                throw new Error(`サーバーからの応答が不正です（HTTP Status: ${res.status}）。`);
            }

            if (!res.ok || data.status === 'error') {
                // PHPから返されたerror_codeに基づいて、日本語のエラーメッセージを設定
                switch (data.error_code) {
                    case 'MISSING_CREDENTIALS':
                        setDisplayError('メールアドレスとパスワードを入力してください。');
                        break;
                    case 'INVALID_CREDENTIALS':
                        setDisplayError('メールアドレスまたはパスワードが正しくありません。');
                        break;
                    case 'DB_ERROR':
                        setDisplayError('データベースでエラーが発生しました。時間をおいて再度お試しください。');
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
                    localStorage.setItem('randomUserId', data.randomUserId); // localStorageに保存
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
        <div className='flex flex-col w-[80%] shadow-black-500 shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-xl p-8 mx-auto my-10 bg-white items-center justify-center'>
            <h1 className='text-2xl font-bold mb-4'>ログイン</h1>

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
                onClick={handleLogin}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    backgroundColor: loading ? '#0070f3' : '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                }}
            >
                {loading ? 'ログイン中...' : 'ログイン'}
            </button>

            {displayError && (
                <div style={{
                    marginTop: '20px',
                    color: 'red',
                    border: '1px solid red',
                    padding: '10px',
                    borderRadius: '5px'
                }}>
                    <h2>エラーが発生しました！ 😱</h2>
                    <p>詳細: {displayError}</p>
                    <p>問題が解決しない場合は、管理者にお問い合わせください。</p>
                </div>
            )}
        </div>
    );
}