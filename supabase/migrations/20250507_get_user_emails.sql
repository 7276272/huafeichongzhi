
-- Function to get user emails (requires service role to run)
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE (id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id, email FROM auth.users;
$$;
