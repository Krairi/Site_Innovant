import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

// NOTE: In a real production environment, ensure your Row Level Security (RLS) policies
// are correctly configured in Supabase to protect data, as the key is exposed in the client.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);