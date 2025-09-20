
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Star, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { getUserData } from "@/lib/supabase-service";

const plans = [
    {
        name: "Gratuito",
        id: "free",
        price: "R$ 0",
        period: "/mês",
        features: [
            { text: "1 projeto ativo", included: true },
            { text: "Até 5 blocos por projeto (Notas, Imagem, Vídeo, Áudio e PDF)", included: true },
            { text: "Kanban limitado (apenas 3 colunas fixas: A Fazer, Fazendo, Feito)", included: true },
            { text: "Calendário básico (sem linha do tempo detalhada)", included: true },
            { text: "Sem Modo Apresentação", included: false },
            { text: "Exportação apenas em JSON (sem PDF)", included: false },
        ],
        cta: "Começar Grátis",
        popular: false,
    },
    {
        name: "Pro",
        id: "mensal",
        price: "R$ 49",
        period: "/mês",
        features: [
            { text: "Projetos ilimitados", included: true },
            { text: "Blocos ilimitados no canvas", included: true },
            { text: "Kanban avançado (totalmente personalizável)", included: true },
            { text: "Calendário + Linha do Tempo completa", included: true },
            { text: "Modo Apresentação Profissional", included: true },
            { text: "Exportação em PDF (Canvas, Kanban, Calendário, etc.)", included: true },
            { text: "Suporte prioritário", included: true },
        ],
        cta: "Fazer Upgrade para o Pro",
        popular: true,
    },
];

export default function PlanPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState("free");

  useEffect(() => {
    const fetchUserAndPlan = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          const userData = await getUserData(session.user.id);
          if (userData?.plan) {
            setUserPlan(userData.plan);
          }
        }
    };

    fetchUserAndPlan();

    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast({
        title: "Pagamento bem-sucedido!",
        description: "Bem-vindo ao Pro! Sua conta foi atualizada.",
      });
      fetchUserAndPlan(); // Re-fetch on success
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (query.get("cancel")) {
      toast({
        variant: "destructive",
        title: "Pagamento cancelado",
        description: "Você pode tentar novamente a qualquer momento.",
      });
      window.history.replaceState(null, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async (planId: 'mensal') => {
    if (planId === 'free' || userPlan === planId) {
      return;
    }
    
    if (!user?.email) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não encontrado. Faça login novamente.' });
      return;
    }
    setLoadingPlan(planId);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email, plan: planId }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.location.href = url;
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao assinar', description: error.message || 'Tente novamente mais tarde.' });
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlanName = plans.find(p => p.id === userPlan)?.name || 'Gratuito';

  return (
    <div>
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Planos e Faturamento</CardTitle>
          <CardDescription>
            Gerencie sua assinatura e detalhes de faturamento. Você está atualmente no plano <span className="font-bold capitalize">{currentPlanName}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid gap-8 md:grid-cols-2">
              {plans.map((plan) => (
                <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''} ${userPlan === plan.id ? 'border-green-500' : ''}`}>
                  {plan.popular && <div className="flex items-center justify-center gap-2 text-center py-1 bg-primary text-primary-foreground font-bold rounded-t-lg"><Star className="w-4 h-4"/>Mais Popular</div>}
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                     <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <ul className="space-y-4 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className={`flex items-start gap-3 ${!feature.included ? 'text-muted-foreground' : ''}`}>
                          {feature.included ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />}
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-8">
                     <Button 
                      className="w-full" 
                      size="lg"
                      variant={plan.popular ? 'default' : 'secondary'} 
                      disabled={userPlan === plan.id || loadingPlan === plan.id}
                      onClick={() => {
                        if (plan.id === 'mensal') {
                          handleCheckout(plan.id);
                        }
                      }}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : userPlan === plan.id ? 'Seu Plano Atual' : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
