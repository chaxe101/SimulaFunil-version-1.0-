
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase/client';

// Basic in-memory rate limiting
const loginAttempts = new Map<string, { count: number; expiry: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_PERIOD = 5 * 60 * 1000; // 5 minutes

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Email e senha são obrigatórios.",
      });
      return;
    }

    // Rate limiting check
    const now = Date.now();
    const attemptInfo = loginAttempts.get(email);

    if (attemptInfo && now < attemptInfo.expiry) {
        toast({
            variant: "destructive",
            title: "Muitas tentativas de login",
            description: `Você está temporariamente bloqueado. Tente novamente em alguns minutos.`,
        });
        return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Increment attempt count on failure
        const newCount = (attemptInfo?.count || 0) + 1;
        if (newCount >= MAX_ATTEMPTS) {
            loginAttempts.set(email, { count: newCount, expiry: now + LOCKOUT_PERIOD });
        } else {
            loginAttempts.set(email, { count: newCount, expiry: now + 60000 }); // 1 min expiry for non-lockout attempts
        }
        
        toast({
          variant: "destructive",
          title: "Erro de Login",
          description: error.message,
        });
      } else {
        // Clear attempts on success
        loginAttempts.delete(email);
        toast({
          title: "Login bem-sucedido!",
          description: "Redirecionando para o dashboard...",
        });
        router.refresh();
      }
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Logo className="h-10 w-10 text-primary" />
          <span className="text-4xl font-headline font-bold">SimulaFunil</span>
        </Link>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription>
                Insira suas credenciais para acessar seus projetos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="voce@exemplo.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Entrar"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
