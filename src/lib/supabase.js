import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ihqockeyvuemsvvzjzoy.supabase.co'
const supabaseAnonKey = 'sb_publishable_l_NFDZ9DukoNBeqkjI7iog_VJOgMF_2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
