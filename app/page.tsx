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

  const phpApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 md:py-10">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダータイトル */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            <span className="inline-flex items-center">
              <svg className="w-8 h-8 md:w-10 md:h-10 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              匿名スレッド一覧
            </span>
          </h1>
          <p className="text-gray-600 text-sm md:text-base">自由に議論できる匿名掲示板</p>
        </div>

        {/* スレッド作成フォーム */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="text-lg md:text-xl font-semibold text-gray-700">新しいスレッドを作成</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スレッドタイトル
              </label>
              <input
                type="text"
                className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                placeholder="スレッドのタイトルを入力してください (100文字まで)"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs md:text-sm text-gray-500">
                  {newThreadTitle.length}/100文字
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={handleCreateThread}
                disabled={creatingThread || !randomUserId || newThreadTitle.trim().length === 0}
                className={`w-full sm:w-auto py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200 text-sm md:text-base ${
                  creatingThread || !randomUserId || newThreadTitle.trim().length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {creatingThread ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    作成中...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    スレッドを作成
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {displayError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {displayError}
              </p>
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </p>
            </div>
          )}
        </div>

        {/* スレッド一覧 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex items-center mb-4 md:mb-6">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-lg md:text-xl font-semibold text-gray-700">スレッド一覧</h2>
          </div>
          
          {loadingThreads ? (
            <div className="flex items-center justify-center py-8 md:py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm md:text-base">スレッドを読み込み中...</p>
              </div>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 text-sm md:text-base mb-2">まだスレッドはありません</p>
              <p className="text-gray-500 text-xs md:text-sm">新しいスレッドを作成して議論を始めましょう！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {threads.map((thread) => (
                <Link key={thread.id} href={`/thread/${thread.id}`}>
                  <div className="block bg-gradient-to-r from-white to-gray-50 p-4 md:p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base md:text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2 flex-1 mr-2">
                        {thread.title}
                      </h3>
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-mono">ID: {thread.random_user_id.substring(0, 8)}...</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{new Date(thread.created_at).toLocaleString('ja-JP')}</span>
                      </div>
                      
                      {thread.post_count !== undefined && (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="font-medium text-blue-600">{thread.post_count} 返信</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}