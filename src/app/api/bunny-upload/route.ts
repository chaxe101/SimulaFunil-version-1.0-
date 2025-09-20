// src/app/api/bunny-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME;
const BUNNY_ACCESS_KEY = process.env.BUNNY_ACCESS_KEY;
const BUNNY_HOSTNAME = process.env.BUNNY_HOSTNAME || 'br.storage.bunnycdn.com';

// Define os limites dos planos em bytes
const PLAN_LIMITS = {
    free: {
        maxFileSize: 5 * 1024 * 1024, // 5 MB
    },
    mensal: { // 'mensal' é o ID do plano Pro
        maxFileSize: 100 * 1024 * 1024, // 100 MB
    },
};

// Helper para criar um cliente Supabase com privilégios de administrador (usando a service_role key)
// Isso é necessário para consultar a tabela 'users' a partir de uma rota de API segura.
function getSupabaseAdminClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Credenciais de serviço do Supabase não estão configuradas no servidor.');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

function getAuthToken(req: NextRequest): string | null {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
}

export async function POST(req: NextRequest) {
    if (!BUNNY_STORAGE_ZONE_NAME || !BUNNY_ACCESS_KEY) {
        console.error('As credenciais do Bunny.net não estão configuradas.');
        return NextResponse.json({ error: 'O serviço de upload não está configurado corretamente.' }, { status: 500 });
    }

    try {
        const token = getAuthToken(req);
        if (!token) {
            return NextResponse.json({ error: 'Não autenticado. Token não fornecido.' }, { status: 401 });
        }

        const supabaseAdmin = getSupabaseAdminClient();

        // Valida o token de acesso para obter o usuário
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            console.error('Erro de autenticação do token:', authError?.message);
            return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
        }

        // Com o usuário validado, busca o plano na tabela 'users' usando a chave de admin
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('plan')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            console.error('Erro ao buscar plano do usuário:', userError?.message);
            return NextResponse.json({ error: 'Não foi possível verificar seu plano de assinatura.' }, { status: 500 });
        }

        const userPlan = (userData.plan as 'free' | 'mensal') || 'free';
        const limits = PLAN_LIMITS[userPlan];

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        
        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
        }

        // Validação do tamanho do arquivo (dupla verificação no backend)
        if (file.size > limits.maxFileSize) {
            return NextResponse.json({
                error: `O tamanho do arquivo (${(file.size / 1024 / 1024).toFixed(2)} MB) excede o limite de ${(limits.maxFileSize / 1024 / 1024).toFixed(2)} MB para o seu plano.`,
            }, { status: 413 }); // 413 Payload Too Large
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE_NAME}/${filePath}`;

        await axios.put(uploadUrl, fileBuffer, {
            headers: {
                'AccessKey': BUNNY_ACCESS_KEY,
                'Content-Type': file.type,
            },
        });

        const publicUrl = `https://${BUNNY_STORAGE_ZONE_NAME}.b-cdn.net/${filePath}`;

        // Salva metadados no Supabase (opcional, mas bom para rastreamento)
        // Você pode adicionar uma tabela `uploads` ou similar para guardar essas informações
        // Por agora, vamos pular essa parte para focar no upload.

        return NextResponse.json({ url: publicUrl, fileName: file.name });

    } catch (error: any) {
        console.error('Erro no processo de upload:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Falha no upload.', details: error.message }, { status: 500 });
    }
}
