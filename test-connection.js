
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/server/.env' });

async function testConnection() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    console.log("Testing connection to:", supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
        if (error) {
            console.error("Connection Failed:", error.message);
            if (error.message.includes("relation does not exist")) {
                console.log("SQL Schema needs to be run.");
            }
        } else {
            console.log("Connection Successful! User count:", data);
        }
    } catch (e) {
        console.error("Fetch Exception:", e.message);
    }
}

testConnection();
