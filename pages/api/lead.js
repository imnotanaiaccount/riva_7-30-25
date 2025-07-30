import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, projectType, message, newsletter } = req.body;

  if (!name || !email || !projectType || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error } = await supabase.from('leads').insert([
    {
      name,
      email,
      project_type: projectType,
      message,
      newsletter: !!newsletter
    }
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Thank you! Your message has been received.' });
} 