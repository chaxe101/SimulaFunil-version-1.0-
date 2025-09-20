'use client';

import { useEditorStore } from '@/stores/editor-store';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { X, Bot, Zap } from 'lucide-react';

export function SimulationPanel() {
  const { isSimulationMode, toggleSimulationMode } = useEditorStore(state => ({
    isSimulationMode: state.isSimulationMode,
    toggleSimulationMode: state.toggleSimulationMode,
  }));

  if (!isSimulationMode) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute inset-0 z-20 bg-black/70 backdrop-blur-sm',
        'transition-opacity duration-300',
        isSimulationMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <Button variant="secondary" className="bg-primary/20 text-primary-foreground hover:bg-primary/30">
          <Bot className="mr-2 h-4 w-4"/>
          Analisar com IA
        </Button>
         <Button variant="secondary" className="bg-green-500/20 text-white hover:bg-green-500/30">
          <Zap className="mr-2 h-4 w-4"/>
          Simular Investimento
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleSimulationMode}>
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar Simulação</span>
        </Button>
      </div>
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white p-8">
            <h2 className="text-3xl font-bold font-headline">Modo Simulação Ativado</h2>
            <p className="text-lg text-white/80 mt-2">Navegue pelos blocos para visualizar a jornada do seu cliente.</p>
        </div>
      </div>
    </div>
  );
}
