-- 1. AUTOMATIC TRIGGER (The Best Way)
-- This setup ensures that whenever ANY user signs up, Supabase 
-- automatically generates their UUID and then this trigger 
-- copies it into your "profiles" table with no manual work.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, -- Supabase Auth generates this UUID automatically
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Member'), 
    'admin'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. NOTE ON UUID GENERATION
-- For other tables (Categories, Products, etc.), use this 
-- in your table definition to make UUIDs automatic:
-- id uuid DEFAULT gen_random_uuid() PRIMARY KEY
