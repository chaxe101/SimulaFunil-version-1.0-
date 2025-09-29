import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  getFunnels as getProjects,
  getUserData,
} from "@/lib/supabase-service";
import { DashboardClient } from './dashboard-client';
import { Funnel as Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = await createServerClient();

  // Verifica se a sessão está válida
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.log("❌ Sessão inválida ou expirada, redirecionando...");
    redirect('/login');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("❌ Usuário não encontrado, redirecionando...");
    redirect('/login');
  }

  const userId = user.id;
  
  try {
    // Fetch data on the server
    const [userData, projects] = await Promise.all([
      getUserData(userId),
      getProjects(userId)
    ]);

    // Se não conseguir buscar os dados, pode ser sessão expirada
    if (!userData) {
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
  } catch (error) {
    console.error("❌ Erro ao buscar dados do dashboard:", error);
    // Em caso de erro, redireciona para login
    redirect('/login');
  }
}