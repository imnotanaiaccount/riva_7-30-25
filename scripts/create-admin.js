const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase environment variables. Please check your .env.local file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const email = 'joshhawleyofficial@gmail.com';
  const password = 'YourStrongPassword123!'; // Change this to a strong password

  console.log('Creating admin user...');
  
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('User already exists. Updating to admin...');
      // Update existing user to admin
      const { data: user, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: { is_admin: true },
          email_confirm: true
        }
      );
      
      if (updateError) throw updateError;
      console.log('✅ Successfully updated user to admin');
      console.log('User ID:', user.id);
    } else {
      // Create new admin user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_admin: true
          },
          emailRedirectTo: 'http://localhost:3000/dashboard'
        }
      });

      if (error) throw error;
      
      console.log('✅ Admin user created successfully!');
      console.log('User ID:', data.user.id);
      
      if (data.user.identities && data.user.identities.length === 0) {
        console.log('⚠️  User might already exist. Try logging in with the provided credentials.');
      }
    }
    
    console.log('\nYou can now log in with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nLogin URL: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:');
    console.error(error.message);
    
    if (error.message.includes('already registered')) {
      console.log('\n⚠️  User already exists. Try logging in with your credentials.');
    }
    
    process.exit(1);
  }
}

createAdminUser();
