
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Hardcoded fallback for production if env vars are missing
const supabaseUrl = process.env.SUPABASE_URL || 'https://uybbbrtmwuqfawdgfwge.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YmJicnRtd3VxZmF3ZGdmd2dlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDY2NCwiZXhwIjoyMDgxNTY2NjY0fQ.zcRIcJ_ZtIzZO9ciz3YXWPIYChHCY1JgFvQdt9dkZUY';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
