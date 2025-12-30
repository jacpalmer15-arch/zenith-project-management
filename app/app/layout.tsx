import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/serverClient';
import { AppShell } from '@/components/app-shell';
import { initializeTasks } from '@/lib/tasks/init';

// Initialize tasks on server start
initializeTasks();

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AppShell user={user}>{children}</AppShell>;
}
