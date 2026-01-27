
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ihqockeyvuemsvvzjzoy.supabase.co'
const supabaseKey = 'sb_secret_x0u_lZGQqlyBD3fkH4pGGQ_2etzO4Dl'

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectTable() {
    const { data, error } = await supabase
        .from('lost_found_items')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else {
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]))
        } else {
            console.log('Table is empty, cannot inspect columns from data.')
        }
    }
}

inspectTable()
