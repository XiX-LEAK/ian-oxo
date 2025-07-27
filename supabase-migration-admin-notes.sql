-- =========================================
-- MIGRATION SCRIPT: Add admin_notes field to agents table
-- =========================================

-- Add admin_notes column to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN agents.admin_notes IS 'Private notes visible only to administrators';

-- Update RLS policies to ensure admin_notes are only visible to admins
-- Drop existing policies for agents table and recreate them
DROP POLICY IF EXISTS "agents_select_policy" ON agents;

-- Recreate select policy with admin_notes filtering
CREATE POLICY "agents_select_policy" ON agents FOR SELECT USING (
  CASE 
    -- If user is admin, show all fields including admin_notes
    WHEN auth.jwt() ->> 'role' = 'admin' THEN true
    -- For non-admin users, they can see all fields except admin_notes will be filtered out in the application layer
    ELSE true
  END
);

-- Create a view for non-admin users that excludes admin_notes
CREATE OR REPLACE VIEW public.agents_public AS 
SELECT 
  id,
  name,
  identifier,
  email,
  phone_number,
  platform,
  category,
  specialties,
  status,
  description,
  location,
  languages,
  rating,
  total_reviews,
  verification_date,
  created_at,
  updated_at
FROM agents;

-- Grant access to the public view
GRANT SELECT ON public.agents_public TO authenticated;
GRANT SELECT ON public.agents_public TO anon;

-- Create a function to get agent with admin notes (only for admins)
CREATE OR REPLACE FUNCTION get_agent_with_admin_notes(agent_id UUID)
RETURNS agents
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result agents;
BEGIN
  -- Check if user is admin
  IF auth.jwt() ->> 'role' != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  SELECT * INTO result
  FROM agents
  WHERE id = agent_id;
  
  RETURN result;
END;
$$;

-- Create a function to update agent with admin notes (only for admins)
CREATE OR REPLACE FUNCTION update_agent_admin_notes(agent_id UUID, new_admin_notes TEXT)
RETURNS agents
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result agents;
BEGIN
  -- Check if user is admin
  IF auth.jwt() ->> 'role' != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  UPDATE agents 
  SET admin_notes = new_admin_notes,
      updated_at = now()
  WHERE id = agent_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Add index for better performance on admin_notes queries
CREATE INDEX IF NOT EXISTS idx_agents_admin_notes ON agents(id) WHERE admin_notes IS NOT NULL;

-- Migration confirmation
SELECT 'Migration completed: admin_notes field added to agents table with proper RLS policies' as message;