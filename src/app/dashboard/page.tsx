
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  getFunnels as getProjects,
  getUserData,
} from "@/lib/supabase-service";
import { DashboardClient } from './dashboard-client';
import { Funnel as Project } from '@/lib/types.tsx';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // A função createServerClient agora é assíncrona e deve ser aguardada.
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userId = user.id;
  
  // Fetch data on the server
  const [userData, projects] = await Promise.all([
    getUserData(userId),
    getProjects(userId)
  ]);
  
  if (!userData) {
      // Handle case where user data might not be created yet, maybe redirect or show an error
      // For now, let's provide sane defaults
      const userEmail = user.email || 'Usuário';
      return (
        <DashboardClient
            initialProjects={[]}
            userName={userEmail.split('@')[0]}
            userPlan="free"
            userId={userId}
        />
      );
  }

  const userPlan = userData.plan === 'mensal' ? 'pro' : 'free';

  return (
    <DashboardClient 
        initialProjects={projects as Project[]} 
        userName={userData.name || user.email?.split('@')[0] || 'Usuário'}
        userPlan={userPlan}
        userId={userId}
    />
  );
}
