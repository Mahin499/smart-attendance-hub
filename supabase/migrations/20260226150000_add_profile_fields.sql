-- Add school_name and photo_url columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN school_name TEXT,
  ADD COLUMN photo_url TEXT;

-- Re-create the trigger function so it also populates the new fields from
-- user_metadata. The trigger is SECURITY DEFINER so it can run as the
-- service role and bypass RLS.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, school_name, photo_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'school_name',
    NEW.raw_user_meta_data->>'photo_url'
  );
  RETURN NEW;
END;
$$;
