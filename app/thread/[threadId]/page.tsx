// nextjs-frontend/app/thread/[threadId]/page.tsx
"use client";

import { useState, useEffect, useCallback, JSX } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../../../contexts/UserContext';
import type { Post, CreatePostToThreadResponse, GetThreadPostsResponse, GetThreadsResponse, Thread } from '../../../api/api'; // Thread と GetThreadsResponse をインポート

export default function ThreadDetailPage(): JSX.Element {
    const { randomUserId, isLoadingUser } = useUser();
    const router = useRouter();
    const params = useParams();
    const threadId = Array.isArray(params.threadId) ? params.threadId[0] : params.threadId;

    const [threadTitle, setThreadTitle] = useState<string>('');
    const [postContent, setPostContent] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
    const [posting, setPosting] = useState<boolean>(false);
    const [displayError, setDisplayError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const phpApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;

    // ページタイトルを設定（スレッドタイトルが取得できたら動的に更新）
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (threadTitle) {
                document.title = `${threadTitle} | 匿名掲示板`;
            } else {
                document.title = 'スレッド詳細 | 匿名掲示板';
            }
        }
    }, [threadTitle]);

    // 未ログイン状態なら登録ページへリダイレクト
    useEffect(() => {
        if (!isLoadingUser && !randomUserId) {
            router.push('/register-user');
        }
    }, [randomUserId, isLoadingUser, router]);

    // スレッドIDが有効かチェック
    useEffect(() => {
        if (!threadId) {
            setDisplayError("有効なスレッドIDが指定されていません。");
            setLoadingPosts(false);
        }
    }, [threadId]);

    // 特定スレッドの投稿（返信）一覧を取得する関数
    const fetchThreadPosts = useCallback(async () => {
        if (!phpApiUrl || !threadId) {
            setDisplayError("PHP APIのURLまたはスレッドIDが設定されていません。");
            setLoadingPosts(false);
            return;
        }
        setLoadingPosts(true);
        setDisplayError(null);
        try {
            const apiEndpoint = `${phpApiUrl}/get_thread_posts.php?thread_id=${threadId}`;
            const res = await fetch(apiEndpoint, {
                cache: 'no-store' // 常に最新の投稿を取得
            });
            const data: GetThreadPostsResponse = await res.json() as GetThreadPostsResponse;

            if (res.ok && data.status === 'success' && data.posts && data.thread) {
                setThreadTitle(data.thread.title);
                // 投稿を降順（新しい投稿が上）にソート
                const sortedPosts = data.posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setPosts(sortedPosts);
            } else {
                setDisplayError(data.message || '投稿（返信）一覧の取得に失敗しました。');
            }
        } catch (e: unknown) {
            console.error("投稿（返信）一覧取得エラー:", e);
            if (e instanceof Error) {
                setDisplayError(`投稿（返信）一覧の取得中にエラーが発生しました: ${e.message}`);
            } else {
                setDisplayError("投稿（返信）一覧の取得中に不明なエラーが発生しました。");
            }
        } finally {
            setLoadingPosts(false);
        }
    }, [phpApiUrl, threadId]);

    // コンポーネントマウント時に投稿一覧を取得
    useEffect(() => {
        if (!isLoadingUser && threadId) {
            fetchThreadPosts();
        }
    }, [fetchThreadPosts, isLoadingUser, threadId]);


    // 投稿（返信）処理
    const handlePost = async (): Promise<void> => {
        if (!phpApiUrl || !threadId) {
            setDisplayError("PHP APIのURLまたはスレッドIDが設定されていません。");
            return;
        }
        if (!randomUserId) {
            setDisplayError("匿名ユーザーIDが見つかりません。ログインしてください。");
            return;
        }
        if (!postContent.trim()) {
            setDisplayError("投稿内容を入力してください。");
            return;
        }
        if (postContent.trim().length > 500) {
            setDisplayError("投稿内容は500文字以内で入力してください。");
            return;
        }

        setPosting(true);
        setDisplayError(null);
        setSuccessMessage(null);

        try {
            const apiEndpoint = `${phpApiUrl}/create_post_to_thread.php`;
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    randomUserId: randomUserId,
                    threadId: threadId,
                    content: postContent.trim()
                }),
            });

            const data: CreatePostToThreadResponse = await res.json() as CreatePostToThreadResponse;

            if (res.ok && data.status === 'success') {
                setSuccessMessage(data.message);
                setPostContent('');
                fetchThreadPosts();
            } else {
                setDisplayError(data.message || '投稿（返信）に失敗しました。');
            }
        } catch (e: unknown) {
            console.error("投稿（返信）エラー:", e);
            if (e instanceof Error) {
                setDisplayError(`投稿（返信）中にエラーが発生しました: ${e.message}`);
            } else {
                setDisplayError("投稿（返信）中に不明なエラーが発生しました。");
            }
        } finally {
            setPosting(false);
        }
    };

    // ユーザー情報がロード中でない、かつ匿名IDがない場合はリダイレクト中なので何も表示しない
    if (!isLoadingUser && !randomUserId) {
        return <></>;
    }

    // スレッドIDがない、またはロード中の表示
    if (!threadId || isLoadingUser || loadingPosts) {
        return (
            <div className='flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10'>
                <div className='bg-white rounded-lg shadow-md p-8 text-center'>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className='text-xl text-gray-700'>スレッドを読み込み中...</p>
                    {displayError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{displayError}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10'>
            {/* ナビゲーション */}
            <div className="mb-6">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    スレッド一覧に戻る
                </Link>
            </div>

            {/* スレッドヘッダー */}
            <div className='bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500'>
                <h1 className='text-2xl md:text-3xl font-bold mb-2 text-gray-800'>{threadTitle}</h1>
                <p className='text-sm md:text-base text-gray-600'>スレッドID: {threadId}</p>
            </div>

            {/* 投稿（返信）フォーム */}
            <div className='bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200'>
                <h2 className='text-lg md:text-xl font-semibold mb-4 text-gray-700 flex items-center'>
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    このスレッドに返信する
                </h2>
                <textarea
                    className='w-full p-4 border border-gray-300 rounded-lg resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                    placeholder="ここに返信内容を入力してください (500文字まで)"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    maxLength={500}
                ></textarea>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-3'>
                    <span className='text-sm text-gray-500'>
                        {postContent.length}/500文字
                    </span>
                    <button
                        onClick={handlePost}
                        disabled={posting || !randomUserId || postContent.trim().length === 0}
                        className={`w-full sm:w-auto py-2 px-6 rounded-lg text-white font-semibold transition-all duration-200 ${posting || !randomUserId || postContent.trim().length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                            }`}
                    >
                        {posting ? '返信中...' : '返信する'}
                    </button>
                </div>
                {displayError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{displayError}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm">{successMessage}</p>
                    </div>
                )}
            </div>

            {/* 投稿（返信）一覧 */}
            <div className='bg-white rounded-lg shadow-md border border-gray-200'>
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h2 className='text-lg md:text-xl font-semibold text-gray-700 flex items-center justify-between'>
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8V4l4 4z" />
                            </svg>
                            返信一覧
                        </span>
                        <span className="text-sm font-normal text-gray-500">
                            {posts.length > 0 ? `${posts.length}件の返信` : '返信なし'}
                        </span>
                    </h2>
                </div>
                
                <div className="p-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className='text-gray-600 text-lg'>まだ返信はありません</p>
                            <p className='text-gray-500 text-sm mt-2'>最初の返信をしてみましょう！</p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {posts.map((post, index) => (
                                <div key={post.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow'>
                                    {/* 返信番号とタイムスタンプ */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 rounded-full">
                                            No.{posts.length - index}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(post.created_at).toLocaleString('ja-JP', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    
                                    {/* 投稿内容 */}
                                    <div className="mb-3">
                                        <p className='text-gray-800 break-words whitespace-pre-wrap leading-relaxed'>{post.content}</p>
                                    </div>
                                    
                                    {/* ユーザー情報 */}
                                    <div className='flex items-center text-sm text-gray-500'>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        匿名ID: 
                                        <span className="font-mono ml-1">
                                            {post.random_user_id}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}