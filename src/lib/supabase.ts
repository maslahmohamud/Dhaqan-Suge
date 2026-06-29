import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vjytjfzcfkcfeilrfogj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Zj5WXuiaDxnnMX0e7CSnZQ_PFpQ8WQO';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);