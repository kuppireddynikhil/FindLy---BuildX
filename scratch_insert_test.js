import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oodfplfuyntblxnothln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZGZwbGZ1eW50Ymx4bm90aGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNjA1MTcsImV4cCI6MjA5NjczNjUxN30.A9vKWoJcCWMEtX1jLEe16SFaNcbAeFjilKJs89cklbU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Attempting to insert a profile with UUID...');
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // valid UUID
      email: 'test@example.com',
      full_name: 'Test UUID Insert'
    })
    .select();
    
  if (error) {
    console.error('Insert error (UUID):', error);
  } else {
    console.log('Insert success (UUID):', data);
  }

  console.log('\nAttempting to insert a profile with integer ID...');
  const { data: dataInt, error: errorInt } = await supabase
    .from('profiles')
    .insert({
      id: 999, // integer ID
      email: 'test_int@example.com',
      full_name: 'Test Int Insert'
    })
    .select();

  if (errorInt) {
    console.error('Insert error (Int):', errorInt);
  } else {
    console.log('Insert success (Int):', dataInt);
  }
}

testInsert();
