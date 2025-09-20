
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';

interface ContentPreviewModalProps {
  content: {
    type: string;
    src: string;
  } | null;
  onClose: () => void;
}

const PdfPreview = ({ src }: { src: string }) => {
  if (!src) return <p>Nenhuma fonte de PDF fornecida.</p>;
  // Agora permite a renderização de Data URIs de PDF
  return (
    <iframe
      src={src}
      title="PDF Preview"
      className="w-full h-full border-0"
    ></iframe>
  );
};


export function ContentPreviewModal({ content, onClose }: ContentPreviewModalProps) {

  if (!content) {
    return null;
  }

  const renderContent = () => {
    const { type, src } = content;

    if (!src) return <p>Nenhum conteúdo para exibir.</p>;

    switch (type) {
      case 'website':
        return (
           <div className="relative w-full h-full flex items-center justify-center bg-black/50">
            <iframe 
                src={src}
                title="Website Preview" 
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
            />
          </div>
        );
      case 'imagem':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-black/50">
            <Image src={src} alt="Image Preview" fill style={{ objectFit: 'contain' }} />
          </div>
        );
      case 'video':
        return (
          <div className="w-full h-full bg-black flex items-center justify-center">
             <video src={src} controls autoPlay className="max-w-full max-h-full" />
          </div>
        );
      case 'audio':
        return <div className="p-8 flex items-center justify-center h-full"><audio src={src} controls autoPlay className="w-full" /></div>;
      case 'pdf':
        return <PdfPreview src={src} />;
      default:
        return <p>Tipo de conteúdo não suportado para pré-visualização.</p>;
    }
  };

  const getTitle = () => {
     switch (content.type) {
      case 'website':
        return "Pré-visualização do Site";
      case 'imagem':
        return "Pré-visualização da Imagem";
      case 'video':
        return "Pré-visualização do Vídeo";
      case 'audio':
        return "Pré-visualização do Áudio";
      case 'pdf':
        return "Pré-visualização do PDF";
      default:
        return "Pré-visualização do Conteúdo";
    }
  }
  
  const getDescription = () => {
    if ((['website'].includes(content.type)) && !content.src.startsWith('data:')) {
      return <>Esta é uma pré-visualização. Alguns conteúdos podem não carregar. <a href={content.src} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Abrir em nova aba</a>.</>;
    }
    return null;
  }

  return (
    <Dialog open={!!content} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle>{getTitle()}</DialogTitle>
          {getDescription() && <DialogDescription>{getDescription()}</DialogDescription>}
        </DialogHeader>
        <div className="p-0 flex-grow h-full bg-muted flex items-center justify-center">
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
