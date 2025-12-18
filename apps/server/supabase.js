
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Ensure these are set in your Environment Variables (Render Dashboard)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL ERROR: Supabase credentials missing from environment variables.");
    // We do NOT hardcode secrets here to prevent leaks.
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
