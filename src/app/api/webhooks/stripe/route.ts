
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Validação robusta das chaves
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Chaves do Supabase para o cliente de serviço (admin) - Lidas SOMENTE no servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
  const missingKeys = [
      !stripeSecretKey && 'STRIPE_SECRET_KEY',
          !webhookSecret && 'STRIPE_WEBHOOK_SECRET',
              !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
                  !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY',
                    ].filter(Boolean).join(', ');
                      
                        console.error(`As seguintes variáveis de ambiente estão faltando: ${missingKeys}`);
                          // Em um ambiente de produção, não devemos expor detalhes do erro.
                            // Lançar um erro aqui irá parar a inicialização do servidor se as chaves estiverem faltando.
                              throw new Error('A configuração de webhooks do servidor de pagamento está incompleta.');
                              }

                              const stripe = new Stripe(stripeSecretKey, {
                                apiVersion: '2024-06-20',
                                });

                                // Crie um cliente Supabase com a chave de serviço para ter privilégios de admin
                                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);


                                export async function POST(req: NextRequest) {
                                  const body = await req.text();
                                    const signature = headers().get('stripe-signature');

                                      try {
                                          if (!signature) {
                                                // Retornar 400 Bad Request, mas não lançar erro para o finally
                                                      return new NextResponse('Cabeçalho Stripe Signature ausente', { status: 400 });
                                                          }
                                                              
                                                                  let event: Stripe.Event;

                                                                      try {
                                                                            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
                                                                                } catch (err: any) {
                                                                                      console.error(`❌ Erro na verificação do webhook: ${err.message}`);
                                                                                            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
                                                                                                }

                                                                                                    // Lidar com o evento checkout.session.completed
                                                                                                        if (event.type === 'checkout.session.completed') {
                                                                                                              const session = event.data.object as Stripe.Checkout.Session;
                                                                                                                    
                                                                                                                          const userEmail = session.metadata?.user_email;
                                                                                                                                const planId = session.metadata?.plan_id as 'mensal' | 'semanal' | undefined;

                                                                                                                                      if (!userEmail || !planId) {
                                                                                                                                              console.error('Email do usuário ou ID do plano faltando nos metadados do Stripe');
                                                                                                                                                      // Ainda retornamos 200 para Stripe, mas logamos o erro.
                                                                                                                                                              return NextResponse.json({ received: true, error: "Metadados incompletos" });
                                                                                                                                                                    }

                                                                                                                                                                          // Usar o cliente admin para interagir com o Supabase
                                                                                                                                                                                const { data: user, error: findError } = await supabaseAdmin
                                                                                                                                                                                        .from('users')
                                                                                                                                                                                                .select('id')
                                                                                                                                                                                                        .eq('email', userEmail)
                                                                                                                                                                                                                .single();
                                                                                                                                                                                                                      
                                                                                                                                                                                                                            if (findError || !user) {
                                                                                                                                                                                                                                    console.error(`Usuário com email ${userEmail} não encontrado no Supabase.`);
                                                                                                                                                                                                                                            // Retornar 200 para o Stripe para evitar retentativas, mas logar o erro.
                                                                                                                                                                                                                                                    return NextResponse.json({ received: true, error: "Usuário não encontrado" });
                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                // Atualiza o plano do usuário, o ID do cliente e da assinatura no Stripe
                                                                                                                                                                                                                                                                      const { error: updateError } = await supabaseAdmin
                                                                                                                                                                                                                                                                              .from('users')
                                                                                                                                                                                                                                                                                      .update({
                                                                                                                                                                                                                                                                                                  plan: planId,
                                                                                                                                                                                                                                                                                                              stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
                                                                                                                                                                                                                                                                                                                          stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
                                                                                                                                                                                                                                                                                                                                  })
                                                                                                                                                                                                                                                                                                                                          .eq('id', user.id);

                                                                                                                                                                                                                                                                                                                                                if (updateError) {
                                                                                                                                                                                                                                                                                                                                                        // Lança o erro para ser capturado pelo catch principal
                                                                                                                                                                                                                                                                                                                                                                throw updateError;
                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                            console.log(`✅ Pagamento bem-sucedido para ${userEmail}. Atualizado para o plano: ${planId}.`);
                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                  } catch (error) {
                                                                                                                                                                                                                                                                                                                                                                                        console.error('Erro geral ao processar o evento de webhook e atualizar o Supabase:', error);
                                                                                                                                                                                                                                                                                                                                                                                              // Logamos o erro, mas não o retornamos para o Stripe
                                                                                                                                                                                                                                                                                                                                                                                                } finally {
                                                                                                                                                                                                                                                                                                                                                                                                    // Garante que o Stripe sempre receba uma resposta de sucesso para evitar retentativas.
                                                                                                                                                                                                                                                                                                                                                                                                        return NextResponse.json({ received: true });
                                                                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                                                                          