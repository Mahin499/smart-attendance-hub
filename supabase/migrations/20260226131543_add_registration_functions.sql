-- Function for faculty to self-register with a valid code
CREATE OR REPLACE FUNCTION public.register_faculty_with_code(_user_id UUID, _code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code_id UUID;
BEGIN
  -- Check code is valid
  SELECT id INTO _code_id FROM registration_codes WHERE code = _code AND is_active = true;
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
END;
$$;

-- Also allow first user to self-assign principal if none exists
CREATE OR REPLACE FUNCTION public.setup_first_principal(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM user_roles WHERE role = 'principal') THEN
    RAISE EXCEPTION 'A principal already exists';
  END IF;
  INSERT INTO user_roles (user_id, role) VALUES (_user_id, 'principal');
END;
$$;
