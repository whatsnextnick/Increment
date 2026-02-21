-- Manual user confirmation script (for development only)
-- Replace 'user@email.com' with the actual email

UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'user@email.com';
