
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// These should be in a .env file
const supabaseUrl = process.env.SUPABASE_URL || 'https://x.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'x';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
