
'use client'

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, Briefcase, Calendar, CalendarDays, CheckCircle, Edit, FileText, Globe, ImageIcon, KanbanSquare, LayoutGrid, Megaphone, PenSquare, Presentation, Rocket, SlidersHorizontal, Target, Users, Video, VideoIcon, XCircle, Bold, Italic, Underline, Star } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const featureDemos = [
    {
        icon: <LayoutGrid />,
        title: "Canvas Visual",
        description: "Construa mapas mentais, fluxogramas e painéis de projetos com total liberdade criativa, conectando diferentes tipos de mídia e ideias em um só lugar.",
        mockup: (
             <div className="relative p-4 bg-[#0F1115] rounded-lg h-full border-2 border-border/50 overflow-hidden">
                {/* Background Dot Pattern */}
                <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Blocks Container - Foreground */}
                <div className="relative w-full h-full z-10 grid grid-cols-2 grid-rows-2 gap-4">
                    {/* Image Node */}
                    <div className="col-start-2 row-start-1 flex items-center justify-center">
                         <div className="w-48 h-28 bg-card rounded-lg text-xs flex flex-col shadow-lg border border-border">
                            <div className='flex items-center gap-2 p-2 w-full border-b border-border' style={{backgroundColor: 'rgba(243, 156, 18, 0.1)'}}>
                                <ImageIcon className="h-4 w-4" style={{color: 'rgb(243, 156, 18)'}} />
                                <span className="font-bold" style={{color: 'rgb(243, 156, 18)'}}>Imagem</span>
                            </div>
                            <p className='text-muted-foreground text-[11px] p-2'>Anúncio Principal</p>
                        </div>
                    </div>
                    
                    {/* Website Node */}
                     <div className="col-start-1 row-start-1 flex items-center justify-center">
                        <div className="w-48 h-28 bg-card rounded-lg text-xs flex flex-col shadow-lg border border-border">
                            <div className='flex items-center gap-2 p-2 w-full border-b border-border' style={{backgroundColor: 'rgba(231, 76, 60, 0.1)'}}>
                                <Globe className="h-4 w-4" style={{color: 'rgb(231, 76, 60)'}} />
                                <span className="font-bold" style={{color: 'rgb(231, 76, 60)'}}>Website</span>
                            </div>
                            <p className='text-muted-foreground text-[11px] p-2'>Página de Vendas</p>
                        </div>
                    </div>

                    {/* Video Node */}
                    <div className="col-start-1 row-start-2 col-span-2 flex items-center justify-center">
                        <div className="w-48 h-28 bg-card rounded-lg text-xs flex flex-col shadow-lg border border-border">
                             <div className='flex items-center gap-2 p-2 w-full border-b border-border' style={{backgroundColor: 'rgba(255, 86, 120, 0.1)'}}>
                                <VideoIcon className="h-4 w-4" style={{color: 'rgb(255, 86, 120)'}} />
                                <span className="font-bold" style={{color: 'rgb(255, 86, 120)'}}>Vídeo</span>
                            </div>
                             <p className='text-muted-foreground text-[11px] p-2'>Tutorial de Uso</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        icon: <KanbanSquare />,
        title: "Kanban de Tarefas",
        description: "Organize suas tarefas em colunas de 'A Fazer', 'Fazendo' e 'Feito' para um controle de fluxo de trabalho ágil e visualmente claro.",
        mockup: (
            <div className="p-4 bg-[#0F1115] rounded-lg h-full border-2 border-border/50 grid grid-cols-3 gap-3">
                 <div className="bg-card/50 p-2 rounded">
                    <p className="font-bold text-sm mb-2 border-b-2 border-blue-500 pb-1">A Fazer</p>
                    <div className="p-2 bg-card rounded-md text-xs mt-2">Revisar proposta</div>
                </div>
                <div className="bg-card/50 p-2 rounded">
                    <p className="font-bold text-sm mb-2 border-b-2 border-yellow-500 pb-1">Fazendo</p>
                    <div className="p-2 bg-card rounded-md text-xs mt-2 animate-pulse">Desenvolver API</div>
                </div>
                <div className="bg-card/50 p-2 rounded">
                    <p className="font-bold text-sm mb-2 border-b-2 border-green-500 pb-1">Feito</p>
                </div>
            </div>
        )
    },
    {
        icon: <PenSquare />,
        title: "Anotação / Bloco de Texto",
        description: "Capture ideias, resumos e informações importantes com um editor de texto completo e integrado, diretamente no seu canvas ou em uma visão dedicada.",
        mockup: (
             <div className="p-4 bg-[#0F1115] rounded-lg h-full border-2 border-border/50 flex items-center justify-center">
                <div className="w-full max-w-sm bg-card rounded-md shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-border/50 bg-muted/30 flex items-center gap-2">
                        <div className="p-1.5 bg-background rounded"><Bold className="w-3 h-3 text-foreground" /></div>
                        <div className="p-1.5 hover:bg-background rounded"><Italic className="w-3 h-3 text-muted-foreground" /></div>
                        <div className="p-1.5 hover:bg-background rounded"><Underline className="w-3 h-3 text-muted-foreground" /></div>
                    </div>
                    <div className="p-4 text-xs space-y-2">
                        <h4 className="font-bold text-primary text-base">Briefing do Projeto</h4>
                        <p className="text-foreground/80">O objetivo principal é criar uma interface <span className="font-bold">intuitiva e fluida</span> para o usuário final.</p>
                        <ul className="list-disc pl-4 text-foreground/70">
                            <li>Foco em usabilidade</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
     {
        icon: <CalendarDays />,
        title: "Calendário de Atividades",
        description: "Visualize seus prazos e planeje suas semanas com uma visão de calendário integrada, que mostra tarefas e eventos importantes.",
        mockup: (
            <div className="p-4 bg-[#0F1115] rounded-lg h-full border-2 border-border/50 flex items-center justify-center">
                <div className="w-full max-w-sm bg-card p-3 rounded-md text-xs shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <ArrowLeft className="w-4 h-4 text-muted-foreground cursor-pointer" />
                        <p className="font-bold text-sm text-foreground">Outubro 2024</p>
                        <ArrowRight className="w-4 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                    <div className="grid grid-cols-7 text-center font-semibold text-muted-foreground text-[10px]">
                        <p>DOM</p><p>SEG</p><p>TER</p><p>QUA</p><p>QUI</p><p>SEX</p><p>SAB</p>
                    </div>
                    <div className="grid grid-cols-7 text-center mt-2 gap-y-1">
                        {[...Array(31)].map((_, i) => (
                             <div key={i} className={`relative p-1 rounded-full ${i + 1 === 15 ? 'bg-primary/20 text-primary font-bold' : ''}`}>
                                {i + 1}
                                {(i + 1 === 10 || i + 1 === 22) && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full"></div>}
                                {(i + 1 === 18) && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    {
        icon: <Presentation />,
        title: "Modo Apresentação",
        description: "Transforme seu canvas em uma apresentação de slides interativa e profissional com apenas um clique, perfeito para reuniões e propostas.",
        mockup: (
             <div className="p-4 bg-[#0F1115] rounded-lg h-full border-2 border-border/50 flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full bg-card p-6 rounded-lg text-center flex flex-col justify-center shadow-2xl shadow-primary/20 border border-primary/50 relative">
                    <h3 className="text-2xl font-bold font-headline">Etapa 1: Pesquisa</h3>
                    <p className="text-sm text-muted-foreground mt-3">Análise de concorrentes e público-alvo.</p>
                </div>
                
                <div className="absolute bottom-6 w-[calc(100%-2rem)] h-12 bg-black/30 backdrop-blur-sm rounded-lg flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold"><ArrowLeft className="w-4 h-4" /></div>
                        <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold"><ArrowRight className="w-4 h-4" /></div>
                    </div>
                    <div className="text-xs font-mono text-white/50">
                        1 / 5
                    </div>
                    <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold"><XCircle className="w-4 h-4" /></div>
                </div>
            </div>
        )
    }
];

const useCases = [
  { icon: <Briefcase className="h-6 w-6 text-primary" />, title: ["Freelancers", "& Consultores"] },
  { icon: <Rocket className="h-6 w-6 text-primary" />, title: ["Startups &", "Empreendedores"] },
  { icon: <BookOpen className="h-6 w-6 text-primary" />, title: ["Professores", "& Estudantes"] },
  { icon: <Megaphone className="h-6 w-6 text-primary" />, title: ["Marketing", "& Vendas"] },
];

const plans = [
    {
        name: "Gratuito",
        id: "free",
        price: "R$ 0",
        period: "/mês",
        features: [
            { text: "1 projeto ativo", included: true },
            { text: "Até 5 blocos por projeto", included: true },
            { text: "Kanban limitado", included: true },
            { text: "Calendário básico", included: true },
            { text: "Exportação apenas em JSON", included: true },
            { text: "Modo Apresentação", included: false },
            { text: "Exportação em PDF", included: false },
            { text: "Suporte prioritário", included: false },
        ],
        cta: "Começar Grátis",
        popular: false,
        href: "/register",
    },
    {
        name: "Pro",
        id: "pro-mensal",
        price: "R$ 49",
        period: "/mês",
        features: [
            { text: "Projetos ilimitados", included: true },
            { text: "Blocos ilimitados", included: true },
            { text: "Kanban avançado", included: true },
            { text: "Calendário + Linha do Tempo", included: true },
            { text: "Modo Apresentação Profissional", included: true },
            { text: "Exportação em PDF", included: true },
            { text: "Suporte prioritário", included: true },
        ],
        cta: "Assinar Plano Pro",
        popular: true,
        href: "/register",
    },
];

const faqItems = [
    {
        question: "Em que o SimulaFunil é diferente de um Trello ou Notion?",
        answer: "Enquanto o Trello foca apenas em Kanban e o Notion em documentos/listas, o SimulaFunil entrega um canvas visual interativo, onde você pode misturar blocos multimídia (imagens, vídeos, PDFs, links, notas, áudios) e ainda integrar com gestão de tarefas, calendário e apresentações."
    },
    {
        question: "Posso realmente apresentar meus projetos direto no SimulaFunl?",
        answer: "Sim! Com o Modo Apresentação, você define a ordem dos blocos e transforma seu canvas em slides interativos. Não precisa exportar para PowerPoint ou Google Slides — já apresenta direto na plataforma."
    },
    {
        question: "É uma ferramenta só de design visual ou também ajuda na execução do projeto?",
        answer: "Ajuda em tudo: você organiza ideias no canvas, planeja tarefas no Kanban, visualiza prazos no calendário e acompanha o progresso em tabela. É visual + gestão integrada."
    },
    {
        question: "O SimulaFunil serve para quais tipos de pessoas?",
        answer: "Ele é ideal para infoprodutores, agências, coaches, equipes de marketing, professores e empreendedores que precisam transformar ideias complexas em fluxos claros e compartilháveis."
    },
    {
        question: "Preciso estar online para usar?",
        answer: "Sim, é uma plataforma web. Tudo roda direto no navegador, sem instalação. Seus projetos ficam salvos na nuvem e podem ser acessados de qualquer computador."
    },
    {
        question: "Funciona no celular?",
        answer: "O SimulaFunil foi pensado para uso em desktop, onde você aproveita toda a experiência visual. Em celular, até é possível abrir, mas não é otimizado — a performance completa é no computador."
    }
]

const Footer = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-8 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold">SimulaFunil</span>
        </div>
        <div className="flex gap-4">
           <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm">Login</Link>
        </div>
        <p className="text-muted-foreground text-sm">&copy; {year} SimulaFunil. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};


export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-headline font-bold">SimulaFunil</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">Planos</Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Login</Link>
            <Button asChild>
                <Link href="/register">Crie sua Conta Grátis</Link>
            </Button>
            </nav>
            <nav className="md:hidden">
                <Button variant="outline" asChild>
                    <Link href="/register">Começar Grátis</Link>
                </Button>
            </nav>
        </header>

        <main className="flex-grow">
            <section id="hero" className="py-20 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-6xl font-bold font-headline">
                Organize ideias e projetos visualmente.
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Transforme suas ideias complexas em mapas visuais e apresentações interativas.
                </p>
                <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/register">Comece a Organizar, é Grátis <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                </div>
            </div>
            </section>

            <section id="hub-preview" className="pb-20 md:pb-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-6 bg-card/50 border border-border/50 rounded-xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Kanban Widget */}
                            <div className="lg:col-span-2 p-4 bg-card rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold">Kanban</h3>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">Ver Completo <ArrowRight className="w-3 h-3"/></span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1"><span>A Fazer (1)</span></div>
                                        <div className="w-full bg-blue-500/20 rounded-full h-1"><div className="bg-blue-500 h-1 rounded-full" style={{width: '33%'}}></div></div>
                                        <div className="mt-4 p-2 bg-muted rounded text-xs">Definir persona do cliente</div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1"><span>Fazendo (2)</span></div>
                                        <div className="w-full bg-yellow-500/20 rounded-full h-1"><div className="bg-yellow-500 h-1 rounded-full" style={{width: '66%'}}></div></div>
                                        <div className="mt-4 space-y-2">
                                            <div className="p-2 bg-muted rounded text-xs">Criar designs da landing page</div>
                                            <div className="p-2 bg-muted rounded text-xs">Desenvolver API de auth</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1"><span>Feito (1)</span></div>
                                        <div className="w-full bg-green-500/20 rounded-full h-1"><div className="bg-green-500 h-1 rounded-full" style={{width: '100%'}}></div></div>
                                        <div className="mt-4 p-2 bg-muted rounded text-xs line-through text-muted-foreground">Configurar projeto inicial</div>
                                    </div>
                                </div>
                            </div>
                            {/* Calendar Widget */}
                            <div className="p-4 bg-card rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">Calendário</h3>
                                     <span className="text-xs text-muted-foreground flex items-center gap-1">Ver Completo <ArrowRight className="w-3 h-3"/></span>
                                </div>
                                <div className="text-xs">
                                     <div className="flex items-center justify-between mb-2">
                                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                                        <p className="font-semibold text-foreground">Outubro 2024</p>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="grid grid-cols-7 text-center font-semibold text-muted-foreground text-[10px] gap-y-2">
                                        <p>dom</p><p>seg</p><p>ter</p><p>qua</p><p>qui</p><p>sex</p><p>sab</p>
                                        <p className="opacity-50">29</p><p className="opacity-50">30</p><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>
                                        <p>6</p><p>7</p><p>8</p><p className="bg-primary/20 text-primary-foreground rounded-full">9</p><p>10</p><p>11</p><p>12</p>
                                        <p>13</p><p>14</p><p>15</p><p>16</p><p>17</p><p>18</p><p>19</p>
                                        <p>20</p><p>21</p><p>22</p><p>23</p><p>24</p><p>25</p><p>26</p>
                                        <p>27</p><p>28</p><p>29</p><p>30</p><p>31</p><p className="opacity-50">1</p><p className="opacity-50">2</p>
                                    </div>
                                </div>
                            </div>
                            {/* Notes Widget */}
                             <div className="lg:col-span-1 p-4 bg-card rounded-lg flex flex-col">
                                 <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold">Brainstorm de Ideias</h3>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">Abrir Anotação <ArrowRight className="w-3 h-3"/></span>
                                </div>
                                <div className="flex-grow flex items-center justify-center">
                                    <p className="text-xs text-muted-foreground text-left line-clamp-4">
                                        - Integrar com ferramenta de e-mail marketing.
                                        - Adicionar templates de funis.
                                        - Criar um modo 'foco' para apresentação.
                                    </p>
                                </div>
                            </div>
                            {/* Canvas Widget */}
                            <div className="lg:col-span-2 p-4 bg-card rounded-lg flex flex-col">
                                 <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold">Canvas Visual</h3>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">Ver Completo <ArrowRight className="w-3 h-3"/></span>
                                </div>
                                <div className="flex-grow flex flex-col bg-muted/30 rounded-md relative">
                                     <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                                     <div className="relative z-10 p-4 w-full h-full flex items-center justify-center">
                                        <p className="text-xs text-muted-foreground">Pré-visualização do seu canvas de projeto.</p>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section id="demo" className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">Uma ferramenta, múltiplas visualizações</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Do planejamento à apresentação, organize seu trabalho da forma que fizer mais sentido para você.</p>
                    </div>
                    <div className="mt-16 space-y-24">
                        {featureDemos.map((feature, index) => (
                            <div key={index} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                                <div className={index % 2 === 0 ? 'md:order-1' : 'md:order-2'}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                            {React.cloneElement(feature.icon as React.ReactElement, { className: 'w-6 h-6' })}
                                        </div>
                                        <h3 className="text-2xl font-bold font-headline">{feature.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                                </div>
                                <div className={`aspect-video ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                                    {feature.mockup}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="use-cases" className="py-20 bg-card/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center">Perfeito para qualquer tipo de projeto</h2>
                 <p className="mt-4 max-w-2xl mx-auto text-center text-muted-foreground">
                    Seja você um consultor, professor, empreendedor ou líder de equipe, a plataforma se adapta às suas necessidades de organização.
                </p>
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
                {useCases.map((useCase) => (
                    <Card key={useCase.title.join(' ')} className="bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4 p-0">
                            <div className="bg-primary/10 p-2 rounded-full shrink-0">
                                {useCase.icon}
                            </div>
                            <CardTitle className="font-headline text-lg m-0">
                                {useCase.title.map((line, index) => <div key={index}>{line}</div>)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
                </div>
            </div>
            </section>

            <section id="pricing" className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center">Escolha o plano ideal para você</h2>
                <p className="mt-4 max-w-2xl mx-auto text-center text-muted-foreground">
                Comece gratuitamente e evolua conforme seus projetos crescem em complexidade.
                </p>
                <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                 {plans.map((plan) => (
                    <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''}`}>
                        {plan.popular && <div className="flex items-center justify-center gap-2 text-center py-1 bg-primary text-primary-foreground font-bold rounded-t-lg"><Star className="w-4 h-4"/>Mais Popular</div>}
                        <CardHeader className="p-6">
                            <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                            <div className="flex items-baseline gap-1 pt-2">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.period}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 pt-0">
                            <ul className="space-y-4">
                            {plan.features.map((feature, index) => (
                                <li key={index} className={`flex items-start gap-3 ${!feature.included ? 'text-muted-foreground' : ''}`}>
                                {feature.included ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />}
                                <span>{feature.text}</span>
                                </li>
                            ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-6 mt-auto">
                            <Button className="w-full" size="lg" variant={plan.popular ? 'default' : 'secondary'} asChild>
                            <Link href={plan.href}>{plan.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                </div>
            </div>
            </section>

            <section id="faq" className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">Perguntas Frequentes</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Encontre respostas para as dúvidas mais comuns sobre o SimulaFunil.</p>
                    </div>
                    <Accordion type="single" collapsible className="w-full mt-12">
                        {faqItems.map((item, index) => (
                             <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg font-semibold text-left">{item.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>
            
            <section id="cta-final" className="py-20 bg-card/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Pare de organizar projetos no escuro.</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Seu próximo grande projeto começa aqui.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" asChild>
                            <Link href="/register">Quero organizar meu projeto agora</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>

        <Footer />
    </div>
  );
}
