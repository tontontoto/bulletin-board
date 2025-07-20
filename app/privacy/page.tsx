// nextjs-frontend/app/privacy/page.tsx
"use client";

import { useEffect } from 'react';
import React from 'react';

export default function PrivacyPage(): React.JSX.Element {
    // ページタイトルを設定
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.title = 'プライバシーポリシー | 匿名掲示板';
        }
    }, []);

    return (
        <div className='flex flex-col w-[95%] sm:w-[85%] lg:w-[70%] xl:w-[60%] max-w-4xl shadow-lg rounded-xl p-4 sm:p-6 lg:p-8 mx-auto my-4 sm:my-6 lg:my-10 bg-white'>
            {/* ヘッダー部分 */}
            <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800'>プライバシーポリシー</h1>
                <p className='text-sm sm:text-base text-gray-600 mt-2'>個人情報の取り扱いについて</p>
            </div>

            {/* コンテンツ */}
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                <div className="space-y-6 sm:space-y-8">
                    {/* 基本方針 */}
                    <section className="bg-blue-50 border border-blue-100 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            基本方針
                        </h2>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            匿名掲示板（以下「当サービス」）では、ユーザーの皆様に安心してご利用いただくため、個人情報の保護を重要な責務と考え、適切な管理と保護に努めています。
                        </p>
                    </section>

                    {/* 収集する情報 */}
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            収集する情報
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                            <ul className="space-y-3 text-sm sm:text-base text-gray-700">
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span><strong>メールアドレス:</strong> ユーザー登録時に必要な情報</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span><strong>匿名ID:</strong> 投稿の識別に使用する自動生成ID</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span><strong>投稿内容:</strong> スレッドやコメントの内容</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span><strong>アクセス情報:</strong> IPアドレス、ブラウザ情報など</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 利用目的 */}
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            利用目的
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                            <ul className="space-y-3 text-sm sm:text-base text-gray-700">
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>サービスの提供・運営</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>ユーザーサポートの提供</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>利用規約違反の対応</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>サービス改善のための分析</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 第三者提供 */}
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            第三者への提供
                        </h2>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                当サービスは、法令に基づく場合や緊急事態を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
                            </p>
                        </div>
                    </section>

                    {/* セキュリティ */}
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            セキュリティ対策
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                                個人情報の安全性を確保するため、以下の対策を実施しています：
                            </p>
                            <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>データベースの暗号化</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>アクセス制限の実装</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>定期的なセキュリティ監査</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 問い合わせ */}
                    <section className="bg-blue-50 border border-blue-100 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            お問い合わせ
                        </h2>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            プライバシーポリシーに関するご質問やご意見がございましたら、お問い合わせページからご連絡ください。
                        </p>
                    </section>

                    {/* 最終更新日 */}
                    <div className="text-center pt-6 border-t border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-500">
                            最終更新日: 2025年1月20日
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
