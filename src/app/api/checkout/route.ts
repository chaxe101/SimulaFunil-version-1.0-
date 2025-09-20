
// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_live')) {
    return NextResponse.json({ error: 'A chave secreta de produção (LIVE) do Stripe não está configurada corretamente no arquivo .env.' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  });

  try {
    const body = await req.json();
    const { email, plan, success_path = '/dashboard/plan?success=true', cancel_path = '/dashboard/plan?cancel=true' } = body;

    if (!email || !plan) {
      return NextResponse.json({ error: 'Email e plano são obrigatórios' }, { status: 400 });
    }

    // ID de Preço (Price ID) para o plano LIVE de R$ 49,00
    const priceId =
      plan === 'mensal'
        ? process.env.STRIPE_PRICE_ID_MENSAL
        : null;

    if (!priceId) {
      return NextResponse.json({ error: `Plano '${plan}' inválido ou não configurado.` }, { status: 400 });
    }
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://simulafunil.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { 
        user_email: email,
        plan_id: plan 
      },
      success_url: `${siteUrl}${success_path}`,
      cancel_url: `${siteUrl}${cancel_path}`,
    });

    if (session.url) {
      return NextResponse.json({ url: session.url });
    } else {
      return NextResponse.json({ error: 'Não foi possível criar a sessão de checkout.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erro na API de Checkout:', error);
    return NextResponse.json({ error: `Ocorreu um erro ao processar seu pagamento: ${error.message}` }, { status: 500 });
  }
}
