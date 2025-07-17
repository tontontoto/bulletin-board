// nextjs-frontend/app/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Linkコンポーネントを追加
import { useUser } from '../contexts/UserContext';
import type { Thread, CreateThreadResponse, GetThreadsResponse } from '../api/api';
import React from 'react';
export default function HomePage(): React.JSX.Element {
  const { randomUserId, isLoadingUser } = useUser();
  const router = useRouter();

  const [newThreadTitle, setNewThreadTitle] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState<boolean>(true);
  const [creatingThread, setCreatingThread] = useState<boolean>(false);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const phpApiUrl: string | undefined = process.env.NEXT_PUBLIC_PHP_API_URL;

  // 未ログイン状態なら登録ページへリダイレクト
  useEffect(() => {
    if (!isLoadingUser && !randomUserId) {
      router.push('/register-user');
    }
  }, [randomUserId, isLoadingUser, router]);

  // スレッド一覧を取得する関数
  const fetchThreads = useCallback(async () => {
    if (!phpApiUrl) {
      setDisplayError("PHP APIのURLが設定されていません。");
      setLoadingThreads(false);
      return;
    }
    setLoadingThreads(true);
    setDisplayError(null);
    try {
      const apiEndpoint = `${phpApiUrl}/get_threads.php`; // スレッド一覧取得API
      const res = await fetch(apiEndpoint);
      const data: GetThreadsResponse = await res.json() as GetThreadsResponse;

      if (res.ok && data.status === 'success' && data.threads) {
        setThreads(data.threads);
      } else {
        setDisplayError(data.message || 'スレッド一覧の取得に失敗しました。');
      }
    } catch (e: unknown) {
      console.error("スレッド一覧取得エラー:", e);
      if (e instanceof Error) {
        setDisplayError(`スレッド一覧の取得中にエラーが発生しました: ${e.message}`);
      } else {
        setDisplayError("スレッド一覧の取得中に不明なエラーが発生しました。");
      }
    } finally {
      setLoadingThreads(false);
    }
  }, [phpApiUrl]);

  // コンポーネントマウント時にスレッド一覧を取得
  useEffect(() => {
    if (!isLoadingUser) { // ユーザー情報ロード完了後に実行
      fetchThreads();
    }
  }, [fetchThreads, isLoadingUser]);


  // スレッド作成処理
  const handleCreateThread = async (): Promise<void> => {
    if (!phpApiUrl) {
      setDisplayError("PHP APIのURLが設定されていません。");
      return;
    }
    if (!randomUserId) {
      setDisplayError("匿名ユーザーIDが見つかりません。ログインしてください。");
      return;
    }
    if (!newThreadTitle.trim()) {
      setDisplayError("スレッドタイトルを入力してください。");
      return;
    }
    if (newThreadTitle.trim().length > 100) { // PHPのバリデーションと合わせる
      setDisplayError("スレッドタイトルは100文字以内で入力してください。");
      return;
    }

    setCreatingThread(true);
    setDisplayError(null);
    setSuccessMessage(null);

    try {
      const apiEndpoint = `${phpApiUrl}/create_thread.php`; // スレッド作成API
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          randomUserId: randomUserId,
          title: newThreadTitle.trim()
        }),
      });

      const data: CreateThreadResponse = await res.json() as CreateThreadResponse;

      if (res.ok && data.status === 'success') {
        setSuccessMessage(data.message);
        setNewThreadTitle(''); // フォームをクリア
        fetchThreads(); // スレッド作成後に一覧を再取得して最新の状態にする
      } else {
        setDisplayError(data.message || 'スレッドの作成に失敗しました。');
      }
    } catch (e: unknown) {
      console.error("スレッド作成エラー:", e);
      if (e instanceof Error) {
        setDisplayError(`スレッド作成中にエラーが発生しました: ${e.message}`);
      } else {
        setDisplayError("スレッド作成中に不明なエラーが発生しました。");
      }
    } finally {
      setCreatingThread(false);
    }
  };

  // ユーザー情報がロード中でない、かつ匿名IDがない場合はリダイレクト中なので何も表示しない
  if (!isLoadingUser && !randomUserId) {
    return <></>;
  }

  return (
    <div className='flex flex-col w-[80%] shadow-black-500 shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-xl p-8 mx-auto my-10 bg-white items-center justify-center'>
      <h1 className='text-3xl font-bold mb-6 text-gray-800'>匿名スレッド一覧</h1>

      {/* スレッド作成フォーム */}
      <div className='w-full max-w-2xl bg-gray-50 p-6 rounded-lg shadow-md mb-8'>
        <h2 className='text-xl font-semibold mb-4 text-gray-700'>新しいスレッドを作成</h2>
        <input
          type="text"
          className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder="スレッドのタイトルを入力してください (100文字まで)"
          value={newThreadTitle}
          onChange={(e) => setNewThreadTitle(e.target.value)}
          maxLength={100}
        />
        <div className='flex justify-between items-center mt-3'>
          <span className='text-sm text-gray-500'>
            {newThreadTitle.length}/100文字
          </span>
          <button
            onClick={handleCreateThread}
            disabled={creatingThread || !randomUserId || newThreadTitle.trim().length === 0}
            className={`py-2 px-6 rounded-lg text-white font-semibold transition-colors duration-200 ${
              creatingThread || !randomUserId || newThreadTitle.trim().length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {creatingThread ? '作成中...' : 'スレッドを作成'}
          </button>
        </div>
        {displayError && (
          <p className="text-red-600 text-sm mt-3">{displayError}</p>
        )}
        {successMessage && (
          <p className="text-green-600 text-sm mt-3">{successMessage}</p>
        )}
      </div>

      {/* スレッド一覧 */}
      <div className='w-full max-w-2xl'>
        <h2 className='text-xl font-semibold mb-4 text-gray-700'>スレッド一覧</h2>
        {loadingThreads ? (
          <p className='text-gray-600'>スレッドを読み込み中...</p>
        ) : threads.length === 0 ? (
          <p className='text-gray-600'>まだスレッドはありません。新しいスレッドを作成しましょう！</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'> {/* タイル状にするためにGridを使用 */}
            {threads.map((thread) => (
              <Link key={thread.id} href={`/thread/${thread.id}`} passHref>
                <div className='block bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer'>
                  <h3 className='text-xl font-bold text-blue-700 mb-2 truncate'>{thread.title}</h3>
                  <div className='text-sm text-gray-600'>
                    <p>作成者ID: {thread.random_user_id.substring(0, 8)}...</p>
                    <p>作成日時: {new Date(thread.created_at).toLocaleString('ja-JP')}</p>
                    {thread.post_count !== undefined && (
                        <p>返信数: {thread.post_count}件</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}