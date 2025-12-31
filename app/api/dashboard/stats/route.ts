import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { conversations, users } from '@/drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Bugünün başlangıcı
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Aktif konuşmalar (status: active)
        const activeConversations = await db
            .select()
            .from(conversations)
            .where(eq(conversations.status, 'active'));

        // Bekleyen konuşmalar (status: pending)
        const pendingConversations = await db
            .select()
            .from(conversations)
            .where(eq(conversations.status, 'pending'));

        // Bugün tamamlanan konuşmalar (status: resolved veya closed, endedAt bugün)
        const completedToday = await db
            .select()
            .from(conversations)
            .where(
                and(
                    gte(conversations.endedAt, today),
                    eq(conversations.status, 'resolved')
                )
            );

        const closedToday = await db
            .select()
            .from(conversations)
            .where(
                and(
                    gte(conversations.endedAt, today),
                    eq(conversations.status, 'closed')
                )
            );

        // Ortalama görüşme süresi (Sadece tamamlananlar)
        // MVP: startedAt ve endedAt farkı
        const completedConversations = await db
            .select({
                startedAt: conversations.startedAt,
                endedAt: conversations.endedAt,
                assignedAgentId: conversations.assignedAgentId
            })
            .from(conversations)
            .where(
                and(
                    eq(conversations.status, 'closed'),
                    gte(conversations.endedAt, today) // Sadece bugün bitenler mi? Yoksa genel mi? Kullanıcı "Dashboard" dediği için genelde "Bugün" veya "Son 7 gün" olur. Şimdilik genel istatistik verelim veya dashboard'a uygun.
                    // Kullanıcı talebi genel analiz gibi.
                    // Şimdilik "Bugün" odaklı dashboard yapısını koruyalım, ama extra "Genel" veriler ekleyelim.
                )
            );

        // Tüm zamanların tamamlananları (Analiz için)
        const allCompleted = await db
            .select({
                startedAt: conversations.startedAt,
                endedAt: conversations.endedAt,
            })
            .from(conversations)
            .where(eq(conversations.status, 'closed'));

        let totalDuration = 0;
        let validDurationCount = 0;

        allCompleted.forEach(c => {
            if (c.startedAt && c.endedAt) {
                totalDuration += (new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime());
                validDurationCount++;
            }
        });

        const avgDuration = validDurationCount > 0 ? Math.round((totalDuration / validDurationCount) / 1000 / 60) : 0; // Dakika cinsinden

        // Yoğunluk Analizi (Son 7 gün)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const lastWeekConversations = await db
            .select({
                startedAt: conversations.startedAt,
            })
            .from(conversations)
            .where(gte(conversations.startedAt, oneWeekAgo));

        const busyHours = new Array(24).fill(0);
        lastWeekConversations.forEach(c => {
            const hour = new Date(c.startedAt).getHours();
            busyHours[hour]++;
        });

        // Admin Performansı (Tüm zamanlar veya son 30 gün)
        // Agent listesini alıp closed sayısını eşleştireceğiz
        const agents = await db.select().from(users).where(eq(users.role, 'agent')); // ve admin? Kullanıcı "admin" dedi ama role 'agent' olabilir.

        // Basit performans: Her bir agent için closed conversation sayısı
        const agentPerformance = await Promise.all(agents.map(async (agent) => {
            const count = await db
                .select()
                .from(conversations)
                .where(and(
                    eq(conversations.assignedAgentId, agent.id),
                    eq(conversations.status, 'closed')
                ));
            return {
                name: agent.name,
                count: count.length
            };
        }));

        // Sıralama
        agentPerformance.sort((a, b) => b.count - a.count);

        return NextResponse.json({
            success: true,
            data: {
                active: activeConversations.length,
                pending: pendingConversations.length,
                completedToday: completedToday.length + closedToday.length, // Sadece bugün bitenler (Dashboard özeti)
                analytics: {
                    avgDuration, // Genel ortalama (dk)
                    // En yoğun saat (index ve count)
                    busiestHour: busyHours.indexOf(Math.max(...busyHours)),
                    busyHoursData: busyHours,
                    agentPerformance
                }
            },
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
