import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Realtime features will be disabled.');
}

// Only create the client if we have a URL, otherwise export a dummy or null
// To avoid breaking imports that expect an object, we can export a proxy or a dummy client
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      channel: () => ({
        on: () => ({
          subscribe: () => ({ unsubscribe: () => {} })
        })
      }),
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    } as any;
