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

    const phpApiUrl: string | undefined = process.env.NEXT_PUBLIC_PHP_API_URL;

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
                setPosts(data.posts);
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
            <div className='flex flex-col w-[80%] shadow-black-500 shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-xl p-8 mx-auto my-10 bg-white items-center justify-center'>
                <p className='text-xl text-gray-700'>スレッドを読み込み中...</p>
                {displayError && <p className="text-red-600 text-sm mt-3">{displayError}</p>}
            </div>
        );
    }

    return (
        <div className='flex flex-col w-[80%] shadow-black-500 shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-xl p-8 mx-auto my-10 bg-white items-center justify-center'>
            <Link href="/" className="self-start text-blue-600 hover:underline mb-4">
                &larr; スレッド一覧に戻る
            </Link>
            <h1 className='text-3xl font-bold mb-2 text-gray-800'>{threadTitle}</h1>
            <p className='text-xl text-gray-600 mb-6'>スレッドID: {threadId}</p>

            {/* 投稿（返信）フォーム */}
            <div className='w-full max-w-2xl bg-gray-50 p-6 rounded-lg shadow-md mb-8'>
                <h2 className='text-xl font-semibold mb-4 text-gray-700'>このスレッドに返信する</h2>
                <textarea
                    className='w-full p-3 border border-gray-300 rounded-lg resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder="ここに返信内容を入力してください (500文字まで)"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    maxLength={500}
                ></textarea>
                <div className='flex justify-between items-center mt-3'>
                    <span className='text-sm text-gray-500'>
                        {postContent.length}/500文字
                    </span>
                    <button
                        onClick={handlePost}
                        disabled={posting || !randomUserId || postContent.trim().length === 0}
                        className={`py-2 px-6 rounded-lg text-white font-semibold transition-colors duration-200 ${posting || !randomUserId || postContent.trim().length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {posting ? '返信中...' : '返信する'}
                    </button>
                </div>
                {displayError && (
                    <p className="text-red-600 text-sm mt-3">{displayError}</p>
                )}
                {successMessage && (
                    <p className="text-green-600 text-sm mt-3">{successMessage}</p>
                )}
            </div>

            {/* 投稿（返信）一覧 */}
            <div className='w-full max-w-2xl'>
                <h2 className='text-xl font-semibold mb-4 text-gray-700'>返信一覧</h2>
                {posts.length === 0 ? (
                    <p className='text-gray-600'>まだ返信はありません。最初の返信をしてみましょう！</p>
                ) : (
                    <div className='space-y-4'>
                        {posts.map((post) => (
                            <div key={post.id} className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
                                <p className='text-gray-800 break-words whitespace-pre-wrap mb-2'>{post.content}</p>
                                <div className='text-sm text-gray-500 flex justify-between items-center'>
                                    <span>
                                        匿名ID: {post.random_user_id.substring(0, 8)}...
                                    </span>
                                    <span>
                                        {new Date(post.created_at).toLocaleString('ja-JP', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}