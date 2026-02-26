-- Extend the faculty registration function to copy the principal's
-- school_name into the new faculty profile so the college is filled automatically.
-- This avoids backend updates later and works even before the user logs in.

CREATE OR REPLACE FUNCTION public.register_faculty_with_code(_user_id UUID, _code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code_id UUID;
  _principal_id UUID;
  _school TEXT;
BEGIN
  -- Check code is valid
  SELECT id, created_by INTO _code_id, _principal_id
    FROM registration_codes
    WHERE code = _code AND is_active = true;
  IF _code_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired registration code';
  END IF;

  -- Check user doesn't already have a role
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already has a role assigned';
  END IF;

  -- Assign faculty role
  INSERT INTO user_roles (user_id, role) VALUES (_user_id, 'faculty');

  -- Deactivate the code (one-time use)
  UPDATE registration_codes SET is_active = false WHERE id = _code_id;

  -- Propagate the school's name from the principal, if available
  SELECT school_name INTO _school FROM profiles WHERE id = _principal_id;
  IF _school IS NOT NULL THEN
    UPDATE profiles SET school_name = _school WHERE id = _user_id;
  END IF;
END;
$$;
