
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ihqockeyvuemsvvzjzoy.supabase.co'
const supabaseKey = 'sb_secret_x0u_lZGQqlyBD3fkH4pGGQ_2etzO4Dl'

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function probe() {
    console.log('Probing schema...')
    const { data, error } = await supabase
        .from('lost_found_items')
        .insert([
            {
                title: 'Schema Probe',
                description: 'Temporary item to check schema',
                category: 'Other',
                type: 'Lost',
                submitter_name: 'Test User', // The column we hope exists or want to test
                user_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
            }
        ])
        .select()

    if (error) {
        console.error('Probe failed:', error.message)
        if (error.message.includes('column "submitter_name" of relation "lost_found_items" does not exist')) {
            console.log('RESULT: Column submitter_name MISSING')
        } else {
            console.log('RESULT: Other error')
        }
    } else {
        console.log('RESULT: Column submitter_name EXISTS')
        // Cleanup
        if (data && data.length > 0) {
            await supabase.from('lost_found_items').delete().eq('id', data[0].id)
        }
    }
}

probe()
