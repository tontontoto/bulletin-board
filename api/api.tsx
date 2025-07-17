export interface RegisterUserResponse {
    status: string;
    message: string;
    randomUserId?: string; // 成功時に返される
    id?: number; // 成功時に返される
    error_code?: string; // エラー時に返される
}
export interface LoginResponse {
    status: string;
    message: string;
    randomUserId?: string;
    error_code?: string;
}
export interface GetUserEmailResponse {
    status: string;
    email?: string;
    registeredAt?: string;
    error_code?: string;
    message?: string;
}
export interface Thread {
    id: number;
    random_user_id: string;
    title: string;
    created_at: string;
    post_count?: number; // スレッド一覧取得APIで追加したカウンタ
}
export interface Post {
    id: number;
    // thread_id: number; // APIから返されないのでここでは不要
    random_user_id: string;
    content: string;
    created_at: string;
}
export interface CreateThreadResponse {
    status: string;
    message: string;
    threadId?: number; // 新しく作成されたスレッドのID
    error_code?: string;
}
export interface GetThreadsResponse {
    status: string;
    message: string;
    threads?: Thread[]; // Thread型の配列
    error_code?: string;
}
export interface GetThreadPostsResponse {
    status: string;
    message: string;
    thread?: {
        id: number;
        title: string;
    };
    posts?: Post[]; // Post型の配列
    error_code?: string;
}
export interface CreatePostToThreadResponse {
    status: string;
    message: string;
    error_code?: string;
}
export interface TestApiResponse {
    message: string;
    timestamp: string;
    status: string;
}