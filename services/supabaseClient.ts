import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL as CONST_URL, SUPABASE_KEY as CONST_KEY } from '../constants';

// Handle Vite env vars (import.meta.env) vs Fallback Constants
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || CONST_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || CONST_KEY;

console.log("Supabase Init:", supabaseUrl ? "URL OK" : "URL Missing");

export const supabase = createClient(supabaseUrl, supabaseKey);