'use client';

import { useEffect, useState } from 'react';

export interface DashboardStats {
    active: number;
    pending: number;
    completedToday: number;
    analytics?: {
        avgDuration: number;
        busiestHour: number;
        busyHoursData: number[];
        agentPerformance: Array<{
            name: string;
            count: number;
        }>;
    };
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        active: 0,
        pending: 0,
        completedToday: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/dashboard/stats');
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            } else {
                setError(data.error || 'Failed to fetch stats');
            }
        } catch (err) {
            setError('An error occurred while fetching stats');
            console.error('Fetch stats error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Her 30 saniyede bir güncelle
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, []);

    return {
        stats,
        isLoading,
        error,
        refetch: fetchStats,
    };
}
