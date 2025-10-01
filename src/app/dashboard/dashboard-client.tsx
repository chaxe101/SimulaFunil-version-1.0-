"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  CalendarDays,
  Blocks,
  Loader2,
  Crown,
  CheckCircle,
  Edit,
  Presentation,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Funnel as Project } from '@/lib/types';
import {
  createFunnel as createProject,
  deleteFunnel as deleteProject,
  importFunnel as importProject,
  renameFunnel as renameProject,
} from "@/lib/supabase-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ProjectCard = ({ project, onDelete, onRename }: { 
  project: Project; 
  onDelete: (id: string) => void; 
  onRename: (project: Project) => void;
}) => {
  const modifiedDate = new Date(project.updated_at).toLocaleDateString();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-semibold text-lg hover:text-primary">
            <Link href={`/editor/${project.id}`}>{project.name}</Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Mais</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onRename(project)}>
                <Edit className="w-4 h-4" /> Renomear
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive flex items-center gap-2 cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="w-4 h-4" /> Deletar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso irá deletar permanentemente o seu projeto
                      dos nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(project.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Deletar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <CalendarDays className="w-4 h-4" />
          <span>Modificado em {modifiedDate}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Blocks className="w-4 h-4" />
          <span>{project.nodes?.length || 0} blocos</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="text-primary p-0" asChild>
          <Link href={`/editor/${project.id}`}>Editar Projeto</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

interface DashboardClientProps {
  initialProjects: Project[];
  userName: string;
  userPlan: string;
  userId: string;
}

export function DashboardClient({ initialProjects, userName, userPlan, userId }: DashboardClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [renameProjectName, setRenameProjectName] = useState("");

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectName.trim() || !userId) return;

    if (userPlan === 'free' && projects.length >= 1) {
      toast({
        variant: "destructive",
        title: "Limite de Projetos Atingido",
        description: "Você atingiu o limite de 1 projeto para o plano gratuito. Faça upgrade para o Pro para criar projetos ilimitados.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newProject = await createProject({ name: newProjectName, nodes: [], edges: [] });
      setCreateProjectOpen(false);
      setNewProjectName("");
      toast({ title: "Sucesso!", description: "Projeto criado. Redirecionando para o editor..." });
      router.push(`/editor/${newProject.id}`);
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectToRename || !renameProjectName.trim()) return;

    setIsLoading(true);
    try {
      await renameProject(projectToRename.id, renameProjectName);
      setProjects(projects.map(f => f.id === projectToRename.id ? {...f, name: renameProjectName} : f));
      toast({ title: "Sucesso", description: "Projeto renomeado com sucesso." });
      setRenameModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const openRenameModal = (project: Project) => {
    setProjectToRename(project);
    setRenameProjectName(project.name);
    setRenameModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      await deleteProject(projectId);
      setProjects(projects.filter(f => f.id !== projectId));
      toast({ title: "Sucesso", description: "Projeto deletado com sucesso." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (userPlan === 'free' && projects.length >= 1) {
        toast({
          variant: "destructive",
          title: "Limite de Projetos Atingido",
          description: "Você atingiu o limite de 1 projeto para o plano gratuito. Faça upgrade para poder importar.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setIsLoading(true);
          try {
            const projectData = JSON.parse(content);
            const newProject = await importProject(projectData, file.name.replace('.json', ''));
            toast({ title: "Sucesso!", description: "Projeto importado. Redirecionando..." });
            router.push(`/editor/${newProject.id}`);
          } catch (error: any) {
            toast({ variant: "destructive", title: "Erro de importação", description: error.message || "Verifique o formato do arquivo." });
          } finally {
            setIsLoading(false);
          }
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };
  
  return (
    <div className="space-y-6">
      {userPlan === "free" && (
        <Alert className="bg-primary/10 border-primary/20 text-foreground">
          <Crown className="h-5 w-5 text-primary" />
          <AlertTitle className="font-bold text-lg text-primary">
            Desbloqueie todo o potencial da plataforma!
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              Você está no plano gratuito. Com o plano Pro, você ganha acesso a:
            </p>
            <ul className="space-y-1.5 list-none pl-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" /> Projetos e blocos ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Presentation className="h-4 w-4 text-green-400" /> Modo Apresentação Profissional (sem marca d'água)
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-400" /> Exportação de projetos em PDF
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" /> Acesso a templates e Kanban avançado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" /> Suporte prioritário
              </li>
            </ul>
          </AlertDescription>
          <Button asChild className="mt-4">
            <Link href="/dashboard/plan">Fazer Upgrade Agora</Link>
          </Button>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold font-headline">Olá, {userName} 👋</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-headline">Meus Projetos</h2>
          <p className="text-muted-foreground">Gerencie seus projetos visuais</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar projetos..."
              className="w-full rounded-lg bg-card pl-8 sm:w-[200px] lg:w-[250px]"
            />
          </div>

          <Button variant="secondary" className="hidden sm:inline-flex" asChild>
            <Label htmlFor="upload-project-json" className="cursor-pointer">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importar JSON
            </Label>
          </Button>
          <input
            type="file"
            id="upload-project-json"
            accept="application/json"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isLoading}
          />

          <Dialog open={isCreateProjectOpen} onOpenChange={setCreateProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Criar Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateProject}>
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Dê um nome ao seu novo projeto. Você poderá alterá-lo depois.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-name" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="project-name"
                      className="col-span-3"
                      placeholder="Ex: Planejamento de Lançamento"
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Criar Projeto"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6">
        {projects.length > 0 ? (
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onRename={openRenameModal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>Nenhum projeto encontrado.</p>
            <p className="mt-2">Que tal criar o seu primeiro?</p>
          </div>
        )}
      </div>

      <Dialog open={isRenameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleRenameProject}>
            <DialogHeader>
              <DialogTitle>Renomear Projeto</DialogTitle>
              <DialogDescription>
                Digite o novo nome para o projeto "{projectToRename?.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rename-project-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="rename-project-name"
                  className="col-span-3"
                  value={renameProjectName}
                  onChange={(e) => setRenameProjectName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}