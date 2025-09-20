
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

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Todos os campos são obrigatórios.",
      });
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        // This will send a confirmation email to the user.
        // You might want to handle this flow in your app.
        // emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro no Registro",
        description: error.message,
      });
    } else if (data.user) {
        // NOTE: A recommended flow is to let the user verify their email.
        // For simplicity, we'll just show a success message.
        // A database trigger in Supabase should handle creating the public.users row.
      toast({
        title: "Registro bem-sucedido!",
        description: "Verifique seu e-mail para confirmar sua conta. Depois, você pode fazer o login.",
      });
      router.push("/login");
    }

    setIsLoading(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleRegister();
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
                Crie sua Conta Gratuita
              </CardTitle>
              <CardDescription>
                Preencha os detalhes abaixo para começar a organizar seus projetos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="Seu Nome" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
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
                  placeholder="Mínimo de 6 caracteres" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Registrar"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Já possui uma conta?{" "}
                <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                >
                    Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

    