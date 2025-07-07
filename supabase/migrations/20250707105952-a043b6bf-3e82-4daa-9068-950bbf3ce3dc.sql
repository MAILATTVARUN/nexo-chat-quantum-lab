
-- Enable Row Level Security on auth.users if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Update profiles table to ensure proper structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS online_status boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- Create or update RLS policies for profiles to allow searching by email
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles for search" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Update profiles trigger to handle email properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable realtime for messages and conversations
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
