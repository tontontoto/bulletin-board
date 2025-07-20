import React from 'react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* メインコンテンツ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* サイト情報 */}
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            匿名掲示板
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            安全で匿名性を保ちながら、<br className="sm:hidden"/>
                            自由に意見交換ができる掲示板です。
                        </p>
                    </div>

                    {/* ナビゲーション */}
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-semibold mb-4 text-gray-300">サイトマップ</h4>
                        <nav className="space-y-3">
                            <Link href="/" className="block text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                                ホーム
                            </Link>
                            <Link href="/register-user" className="block text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                                ユーザー登録
                            </Link>
                            <Link href="/user-info" className="block text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                                ユーザー情報
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* 区切り線 */}
                <div className="border-t border-gray-800 mt-8 pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        {/* コピーライト */}
                        <p className="text-gray-500 text-sm text-center sm:text-center">
                            © 2025 匿名掲示板. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
