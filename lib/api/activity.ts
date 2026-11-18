import { supabase } from '../supabase';
import { messages } from '../messages';

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

export async function viewActivity(): Promise<{ data: ActivityItem[] | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: messages.activity.loadError };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('user_activity')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: messages.activity.loadError };
  return { data: data || [], error: null };
}

export async function viewAlerts(): Promise<{ data: ActivityItem[] | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: messages.alerts.loadError };

  const { data, error } = await supabase
    .from('user_activity')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'alert_received')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: messages.alerts.loadError };
  return { data: data || [], error: null };
}
