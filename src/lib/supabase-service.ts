
'use server'

import { createServerClient } from '@/lib/supabase/server';
import { Funnel, UserData, Video, CalendarEvent } from './types.tsx';
import { Node, Edge } from 'reactflow';
import { EditorView, NotesContent } from '@/stores/editor-store';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Zod Schema for Funnel import validation
const FunnelImportSchema = z.object({
  name: z.string().min(1, { message: "O nome do projeto não pode ser vazio." }),
  nodes: z.array(z.any()), // Can be more specific if node structure is consistent
  edges: z.array(z.any()), // Can be more specific if edge structure is consistent
  presentation_order: z.array(z.string()).optional(),
  analysis: z.record(z.any()).optional(),
});


// --- User Management ---
export const getUserData = async (uid: string): Promise<UserData | null> => {
    const supabase = await createServerClient();

    const { data: user, error } = await supabase
        .from('users')
        .select('name, email, plan')
        .eq('id', uid)
        .single();

    if (error) {
        console.error('Error fetching user data:', error.message);
        return null;
    }

    return user as UserData;
};

export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
    const supabase = await createServerClient();

    // Update the public.users table
    const { error: usersTableError } = await supabase
        .from('users')
        .update({ name: updates.name })
        .eq('id', uid);

    if (usersTableError) {
        console.error('Error updating public.users table:', usersTableError.message);
        throw new Error(`Could not update user data: ${usersTableError.message}`);
    }

    // Also update the user_metadata in the auth.users table
    const { error: authUserError } = await supabase.auth.updateUser({
        data: { full_name: updates.name }
    });
    
    if (authUserError) {
        console.error('Error updating auth.user metadata:', authUserError.message);
        throw new Error(`Could not update user auth metadata: ${authUserError.message}`);
    }
}


// --- Funnel (Project) Management ---

export const getFunnels = async (user_id: string): Promise<Funnel[]> => {
    const supabase = await createServerClient();

    const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .eq('user_id', user_id);

    if (error) {
        console.error('Error fetching funnels:', error.message);
        throw new Error(`Could not fetch funnels: ${error.message}`);
    }
    return data as Funnel[];
};

export const getFunnelById = async (funnelId: string): Promise<Funnel | null> => {
    const supabase = await createServerClient();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    if (!sessionUser) return null;


    const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .eq('user_id', sessionUser.id)
        .eq('id', funnelId)
        .single();

    if (error) {
        console.error('Error fetching funnel by ID:', error.message);
        return null;
    }
    return data as Funnel;
};

export const getFunnelAndUserData = async (funnelId: string, userId: string): Promise<{ funnelData: Funnel | null; userData: UserData | null }> => {
    const [funnelData, userData] = await Promise.all([
        getFunnelById(funnelId),
        getUserData(userId),
    ]);
    return { funnelData, userData };
};

export const createFunnel = async (funnelData: { name: string; nodes: Node[]; edges: Edge[] }): Promise<Funnel> => {
    const supabase = await createServerClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if(sessionError || !session) {
        console.error('Error getting session:', sessionError);
        throw new Error("User not authenticated.");
    }
    
    const newFunnelData: any = {
        user_id: session.user.id,
        name: funnelData.name, // Basic sanitization can be added here if needed
        nodes: funnelData.nodes || [],
        edges: funnelData.edges || [],
        notes: [{ id: `note_${Date.now()}`, title: 'Anotação Principal', content: '' }],
        calendar_events: [] as CalendarEvent[],
        status: 'draft' as const,
        presentation_order: ['hub', 'fluxo'] as EditorView[],
        analysis: { leads: 1000, buyers: 50 },
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('funnels')
        .insert(newFunnelData)
        .select()
        .single();

    if (error) {
        console.error('Error creating funnel:', error);
        throw new Error(`Could not create funnel: ${error.message}`);
    }
    
    revalidatePath('/dashboard');
    return data as Funnel;
};

export const updateFunnel = async (funnelId: string, updates: Partial<Omit<Funnel, 'id' | 'user_id' | 'created_at'>>): Promise<void> => {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated.");

    const dataToUpdate = { ...updates, updated_at: new Date().toISOString() };
    
    const { error } = await supabase
        .from('funnels')
        .update(dataToUpdate)
        .eq('id', funnelId)
        .eq('user_id', session.user.id);
    
    if (error) {
        console.error('Error updating funnel:', error.message);
        throw new Error(`Could not update funnel: ${error.message}`);
    }
};


export const renameFunnel = async (funnelId: string, newName: string): Promise<void> => {
  await updateFunnel(funnelId, { name: newName });
  revalidatePath('/dashboard');
};

export const deleteFunnel = async (funnelId: string): Promise<void> => {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated.");
    
    const { error } = await supabase
        .from('funnels')
        .delete()
        .eq('id', funnelId)
        .eq('user_id', session.user.id);

    if (error) {
        console.error('Error deleting funnel:', error.message);
        throw new Error(`Could not delete funnel: ${error.message}`);
    }
    revalidatePath('/dashboard');
};

export const importFunnel = async (funnelData: any, defaultName: string): Promise<Funnel> => {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated.");

  try {
    // Validate the incoming data structure using Zod
    const parsedData = FunnelImportSchema.parse(funnelData);

    const funnelToCreate = {
      name: parsedData.name || defaultName,
      nodes: parsedData.nodes,
      edges: parsedData.edges,
    };
    
    const newFunnel = await createFunnel(funnelToCreate);
    
    const updates: Partial<Omit<Funnel, 'id' | 'user_id' | 'created_at'>> = {};
    if (parsedData.presentation_order) updates.presentation_order = parsedData.presentation_order as EditorView[];
    if (parsedData.analysis) updates.analysis = parsedData.analysis;

    if (Object.keys(updates).length > 0) {
      await updateFunnel(newFunnel.id, updates);
      revalidatePath('/dashboard');
      return { ...newFunnel, ...updates };
    }
    
    revalidatePath('/dashboard');
    return newFunnel;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log the detailed validation error for debugging
      console.error("Zod validation error during import:", error.issues);
      throw new Error("Arquivo JSON inválido. Verifique o formato do arquivo e tente novamente.");
    }
    // Re-throw other errors
    throw error;
  }
}

// --- Video Management ---
export const saveVideoMetadata = async (videoData: Omit<Video, 'id' | 'created_at'>): Promise<Video> => {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();

    if (error) {
        console.error('Error saving video metadata:', error);
        throw new Error(`Could not save video metadata: ${error.message}`);
    }

    return data as Video;
};
