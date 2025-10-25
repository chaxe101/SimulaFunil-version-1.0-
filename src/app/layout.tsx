import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'SimulaFunil — Crie, visualize e simule funis de vendas com inteligência',
  description:
    'Planeje e visualize seus funis de vendas com o SimulaFunil. Ferramenta intuitiva para criar jornadas, simular resultados e otimizar conversões. Ideal para infoprodutores, afiliados, agências e e-commerces.',
  keywords: [
    'simulafunil',
    'simula funil',
    'simulador de funil',
    'funil de vendas',
    'planejamento de funil',
    'criador de funis',
    'simulador de marketing',
    'jornada do cliente',
    'automação de funil',
    'mapa de funil',
    'ferramenta de funil de vendas',
  ],
  openGraph: {
    title: 'SimulaFunil — Simulador de Funil de Vendas Inteligente',
    description:
      'Crie e simule seus funis de vendas em minutos com o SimulaFunil. Visual moderno, simples e estratégico.',
    url: 'https://simulafunil.com',
    siteName: 'SimulaFunil',
    images: [
      {
        url: 'https://simulafunil.com/imagem-de-capa.jpg',
        width: 1200,
        height: 630,
        alt: 'SimulaFunil — simulador de funil de vendas',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SimulaFunil — Simulador de Funil de Vendas Inteligente',
    description:
      'Planeje, visualize e simule seus funis de vendas com praticidade.',
    images: ['https://simulafunil.com/imagem-de-capa.jpg'],
  },
  alternates: {
    canonical: 'https://simulafunil.com',
  },
  metadataBase: new URL('https://simulafunil.com'),
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: 'SimulaFunil' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
