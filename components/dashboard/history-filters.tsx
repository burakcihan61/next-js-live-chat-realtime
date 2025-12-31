'use client';

interface HistoryFiltersProps {
    status: 'all' | 'closed' | 'resolved';
    search: string;
    startDate: string;
    endDate: string;
    onStatusChange: (status: 'all' | 'closed' | 'resolved') => void;
    onSearchChange: (search: string) => void;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onReset: () => void;
}

export function HistoryFilters({
    status,
    search,
    startDate,
    endDate,
    onStatusChange,
    onSearchChange,
    onStartDateChange,
    onEndDateChange,
    onReset,
}: HistoryFiltersProps) {
    return (
        <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Ziyaretçi adı veya email ara..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="resolved">Çözüldü</option>
                    <option value="closed">Kapalı</option>
                </select>

                {/* Start Date */}
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* End Date */}
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Reset Button */}
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                    Sıfırla
                </button>
            </div>
        </div>
    );
}
