
-- Add online status tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN online_status BOOLEAN DEFAULT false,
ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing profiles to have default values
UPDATE public.profiles 
SET online_status = false, last_seen = now() 
WHERE online_status IS NULL OR last_seen IS NULL;
