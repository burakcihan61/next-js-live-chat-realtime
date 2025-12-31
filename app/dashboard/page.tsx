'use client';

import Link from 'next/link';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

export default function DashboardPage() {
    const { stats, isLoading } = useDashboardStats();

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Hoş geldiniz</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Aktif Konuşmalar</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {isLoading ? (
                                    <span className="animate-pulse">-</span>
                                ) : (
                                    stats.active
                                )}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {isLoading ? (
                                    <span className="animate-pulse">-</span>
                                ) : (
                                    stats.pending
                                )}
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Bugün Tamamlanan</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {isLoading ? (
                                    <span className="animate-pulse">-</span>
                                ) : (
                                    stats.completedToday
                                )}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            {stats.analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Hourly Traffic Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Yoğunluk Analizi (Son 7 Gün)</h2>
                        <div className="flex items-end justify-between h-48 gap-1">
                            {stats.analytics.busyHoursData.map((count, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div
                                        className={`w-full rounded-t-sm transition-all duration-500 ${i === stats.analytics?.busiestHour ? 'bg-blue-600' : 'bg-blue-200 hover:bg-blue-400'}`}
                                        style={{ height: `${Math.max(count * 10, 5)}%`, minHeight: '4px' }}
                                    />
                                    <span className="text-[10px] text-gray-400 rotate-0 md:rotate-0">{i}</span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                        Saat {i}:00 - {count} Görüşme
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-2">Saatler (00 - 23)</p>
                    </div>

                    {/* Agent Performance & Summary */}
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Genel Özet</h2>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Ortalama Görüşme Süresi</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.analytics.avgDuration} dk</p>
                                </div>
                            </div>
                        </div>

                        {/* Agent List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Temsilci Performansı</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Temsilci</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Kapatılan Konuşma</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.analytics.agentPerformance.length > 0 ? (
                                            stats.analytics.agentPerformance.map((agent, index) => (
                                                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{agent.name}</td>
                                                    <td className="px-4 py-3 text-right">{agent.count}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="px-4 py-3 text-center text-gray-500">Henüz veri yok</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/dashboard/conversations"
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Konuşmalar</h3>
                            <p className="text-sm text-gray-600">Aktif konuşmaları görüntüle ve yönet</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/history"
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Geçmiş</h3>
                            <p className="text-sm text-gray-600">Tamamlanan konuşmaları incele</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
