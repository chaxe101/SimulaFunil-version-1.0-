
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit, LifeBuoy, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

type FormType = 'melhorias' | 'ajuda' | null;

const forms: Record<NonNullable<FormType>, { title: string; description: string; url: string }> = {
    melhorias: {
        title: "Sugerir Melhorias e Feedback",
        description: "Sua opinião é muito importante para nós! Use o formulário abaixo para enviar sugestões e dar seu feedback.",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSeN880Wx7pESHTVoCc-p4AP85jF6rhoKeViZzCmPoR70yrerg/viewform?embedded=true",
    },
    ajuda: {
        title: "Precisa de Ajuda?",
        description: "Encontrou um problema ou precisa de suporte técnico? Preencha o formulário e nossa equipe irá te ajudar.",
        url: "https://forms.gle/2L5nozKKB3MezQCv7",
    },
};

export default function SuportePage() {
  const [activeForm, setActiveForm] = useState<FormType>(null);

  const handleFormSelect = (formType: NonNullable<FormType>) => {
    setActiveForm(formType);
  }

  const selectedFormData = activeForm ? forms[activeForm] : null;

  return (
    <main className="flex-grow flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Central de Suporte e Feedback</CardTitle>
          <CardDescription>
            Precisa de ajuda rápida ou quer compartilhar uma ideia? Escolha uma das opções abaixo.
          </CardDescription>
           <div className="flex flex-col items-center justify-center gap-4 pt-6">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link href="https://wa.me/message/K2QNHD7MBL6XJ1" target="_blank">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Suporte via WhatsApp
                </Link>
              </Button>

              <div className="flex items-center w-full max-w-xs py-2">
                <Separator className="flex-grow" />
                <span className="px-4 text-xs text-muted-foreground">OU</span>
                <Separator className="flex-grow" />
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={() => handleFormSelect('melhorias')} variant={activeForm === 'melhorias' ? 'default' : 'outline'}>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Sugerir Melhorias
                </Button>
                <Button onClick={() => handleFormSelect('ajuda')} variant={activeForm === 'ajuda' ? 'default' : 'outline'}>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Relatar Problema
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
            {selectedFormData ? (
                <div className="mt-4 border-t pt-6">
                    <div className="text-center mb-4">
                        <h3 className="font-headline text-2xl">{selectedFormData.title}</h3>
                        <p className="text-muted-foreground text-sm">{selectedFormData.description}</p>
                    </div>
                    <div className="aspect-w-16 aspect-h-9 md:aspect-h-12 w-full">
                        <iframe 
                            src={selectedFormData.url}
                            width="100%" 
                            height="800" 
                            frameBorder="0" 
                            marginHeight={0} 
                            marginWidth={0}>
                                Carregando…
                        </iframe>
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground border-t border-dashed mt-4">
                    <p>Selecione uma opção de formulário acima para começar.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
