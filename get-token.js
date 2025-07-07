// Script to get a JWT token for testing
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and anon key from the .env file
const supabaseUrl = 'https://vgzhkvnrutesdynrrlpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnemhrdm5ydXRlc2R5bnJybHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDc4NzksImV4cCI6MjA2NzQ4Mzg3OX0.cjWfW_GdhQpiF_-hq6IcoWNEDLx2Yncqe8Bx0DqvW3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Replace with your actual user credentials
const email = 'test@example.com';
const password = 'your-password';

async function getToken() {
  try {
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error.message);
      return;
    }

    // Output the session token and construct the curl command
    console.log('JWT Token:', data.session.access_token);
    console.log('\nCurl command to test the function:');
    console.log(`curl -X POST 'https://vgzhkvnrutesdynrrlpm.supabase.co/functions/v1/create-checkout-session' \\
-H 'Authorization: Bearer ${data.session.access_token}' \\
-H 'Content-Type: application/json' \\
-H 'apikey: ${supabaseKey}' \\
--data '{"item": "premium"}'`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getToken();
