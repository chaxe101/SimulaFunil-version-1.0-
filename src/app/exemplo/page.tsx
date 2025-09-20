
'use client';

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { FunnelAnimation } from '@/components/funnel-animation';

export default function ExemploPage() {
    return (
        <ReactFlowProvider>
            <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8 relative">
                <div className="absolute top-6 left-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-headline font-bold">SimulaFunil</span>
                    </Link>
                </div>
                
                <div className="w-full max-w-6xl h-[600px] flex-grow flex flex-col items-center justify-center">
                     <FunnelAnimation />
                </div>

                <div className="mt-8 text-center">
                    <h1 className="text-3xl font-bold font-headline">Dê vida ao seu projeto.</h1>
                    <p className="text-muted-foreground mt-2 max-w-xl">
                        Veja como é simples e rápido planejar, visualizar e otimizar seu projeto visual com o SimulaFunil.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <Button asChild>
                            <Link href="/register">Crie sua Conta Grátis</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </ReactFlowProvider>
    )
}

    