
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateUserData } from "@/lib/supabase-service";

export default function SettingsPage() {
  const { toast } = useToast();
  
  // State for user info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setName(user.user_metadata.full_name || 'Usuário');
        setEmail(user.email || 'usuario@exemplo.com');
      }
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !name) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Nome não pode ser vazio.' });
        return;
    }
    
    setIsSavingProfile(true);
    try {
        await updateUserData(userId, { name });
        toast({ title: 'Sucesso!', description: 'Seu nome foi atualizado.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
        setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Erro', description: 'As novas senhas não coincidem.' });
      return;
    }
    if (newPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Erro', description: 'A nova senha deve ter no mínimo 6 caracteres.' });
        return;
    }

    setIsSavingPassword(true);
    
    // Note: Supabase's updateUser password method doesn't require the current password
    // for a logged-in user. The current password field here is for UI/UX security practice
    // but isn't used in the API call itself. A more secure flow might involve reauthentication.
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar senha', description: error.message });
    } else {
        toast({ title: 'Sucesso!', description: 'Sua senha foi alterada.' });
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
    }

    setIsSavingPassword(false);
  };


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Configurações da Conta</CardTitle>
          <CardDescription>
            Gerencie as configurações da sua conta e da aplicação aqui.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <form onSubmit={handleProfileUpdate}>
            <CardHeader>
            <CardTitle className="font-headline">Informações Pessoais</CardTitle>
            <CardDescription>
                Atualize seus detalhes pessoais aqui.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSavingProfile}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
                </div>
            </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
            </Button>
            </CardFooter>
        </form>
      </Card>
      <Card>
        <form onSubmit={handlePasswordUpdate}>
            <CardHeader>
            <CardTitle className="font-headline">Senha</CardTitle>
            <CardDescription>
                Altere sua senha aqui. É uma boa ideia usar uma senha forte que você não esteja usando em outro lugar.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isSavingPassword}
                    placeholder="Deixe em branco se não aplicável"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSavingPassword}
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSavingPassword}
                    required
                />
                </div>
            </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Atualizar Senha
            </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
