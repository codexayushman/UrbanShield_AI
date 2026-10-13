import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface RouteComplaint {
  id: string;
  route_name: string;
  destination: string;
  feedback: 'safe' | 'unsafe';
  description: string;
  sector: string;
  media_urls: string[];
  reporter_name: string;
  status: string;
  created_at: string;
}

export interface NewComplaint {
  routeName: string;
  destination: string;
  feedback: 'safe' | 'unsafe';
  description: string;
  sector?: string;
  reporterName?: string;
  mediaFiles?: File[];
}

const BUCKET = 'route-complaint-media';

async function uploadMediaFiles(files: File[]): Promise<string[]> {
  if (!supabase || files.length === 0) return [];

  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `complaint-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      console.error('Upload error:', error.message);
      continue;
    }
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    if (urlData?.publicUrl) urls.push(urlData.publicUrl);
  }
  return urls;
}

export async function submitComplaint(input: NewComplaint): Promise<{ success: boolean; error?: string; data?: RouteComplaint }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Database not configured. Complaints cannot be saved in demo mode.' };
  }

  let mediaUrls: string[] = [];
  if (input.mediaFiles && input.mediaFiles.length > 0) {
    mediaUrls = await uploadMediaFiles(input.mediaFiles);
  }

  const { data, error } = await supabase
    .from('route_complaints')
    .insert({
      route_name: input.routeName,
      destination: input.destination,
      feedback: input.feedback,
      description: input.description,
      sector: input.sector || 'Unknown',
      media_urls: mediaUrls,
      reporter_name: input.reporterName || 'Anonymous',
      status: 'submitted',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as RouteComplaint };
}

export async function fetchComplaints(limit = 20): Promise<RouteComplaint[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('route_complaints')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Fetch complaints error:', error.message);
    return [];
  }

  return (data as RouteComplaint[]) || [];
}
