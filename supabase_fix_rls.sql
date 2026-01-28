-- 1. Enable RLS (just in case)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 2. Drop the policy if it already exists (prevents "policy already exists" error)
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.subscribers;

-- 3. Re-create the policy allowing public inserts
CREATE POLICY "Enable insert for anon users" 
ON public.subscribers 
FOR INSERT 
TO anon 
WITH CHECK (true);
