import { auth } from '@/lib/auth/config';
import ConversationsPageClient from '@/components/dashboard/conversations-page-client';

export default async function ConversationsPage() {
  const session = await auth();

  // Layout already handles auth, but we need session for client component
  return <ConversationsPageClient session={session as any} />;
}
