
'use server';

/**
 * @fileOverview Flow para gerar um vídeo de demonstração do SimulaFunil.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { MediaPart, Part } from 'genkit';

async function downloadVideoToBase64(videoPart: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    // A chave de API é necessária para acessar a URL do vídeo gerado.
    // Certifique-se que GEMINI_API_KEY está no seu .env
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY não encontrada nas variáveis de ambiente.");
    }

    const videoUrl = `${videoPart.media!.url}&key=${apiKey}`;
    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok || !videoResponse.body) {
        throw new Error(`Falha ao baixar o vídeo. Status: ${videoResponse.status}`);
    }

    const videoBuffer = await videoResponse.buffer();
    return `data:video/mp4;base64,${videoBuffer.toString('base64')}`;
}

export const generateFunnelVideo = ai.defineFlow(
    {
        name: 'generateFunnelVideoFlow',
        inputSchema: undefined,
        outputSchema: undefined,
    },
    async () => {
        console.log('Iniciando geração de vídeo do funil...');

        let operation;
        try {
            const result = await ai.generate({
                model: googleAI.model('veo-2.0-generate-001'),
                prompt: `Uma animação dinâmica mostrando um funil de vendas sendo construído em uma interface escura e moderna. 
                A animação começa com o aparecimento de um bloco 'Meta Ads'. Em seguida, um bloco 'Página de Vendas' 
                aparece, e uma linha brilhante os conecta. Uma miniatura de uma página de vendas aparece dentro do bloco. 
                Depois, um bloco 'Checkout' aparece, conectado por outra linha, e uma miniatura de uma página de checkout 
                surge dentro dele. Finalmente, um bloco 'E-mail de boas-vindas' aparece com uma linha de conexão. 
                O estilo é limpo, tecnológico e usa cores vibrantes em tons de rosa e azul.`,
                config: {
                    durationSeconds: 8,
                    aspectRatio: '16:9',
                },
            });
            operation = result.operation;
        } catch (error: any) {
            if (error.message && error.message.includes('FAILED_PRECONDITION')) {
                 throw new Error("A geração de vídeo requer faturamento ativo na sua conta do Google Cloud. Por favor, ative o faturamento para usar este recurso.");
            }
            throw error;
        }


        if (!operation) {
            throw new Error('O modelo não retornou uma operação para geração de vídeo.');
        }

        console.log('Aguardando a conclusão da operação de vídeo...');
        // O processo de geração de vídeo pode levar alguns minutos.
        while (!operation.done) {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Aguarda 5 segundos
            operation = await ai.checkOperation(operation);
            console.log(`Status da operação: ${operation.done ? 'Concluído' : 'Em andamento'}`);
        }

        if (operation.error) {
            throw new Error(`Falha ao gerar o vídeo: ${operation.error.message}`);
        }

        const videoPart = operation.output?.message?.content.find(
            (p: Part): p is MediaPart => 'media' in p && !!p.media
        );

        if (!videoPart) {
            throw new Error('Vídeo gerado não encontrado na resposta da operação.');
        }
        
        console.log('Download do vídeo gerado...');
        const videoDataUri = await downloadVideoToBase64(videoPart);
        console.log('Vídeo convertido para Base64 com sucesso.');

        return videoDataUri;
    }
);
