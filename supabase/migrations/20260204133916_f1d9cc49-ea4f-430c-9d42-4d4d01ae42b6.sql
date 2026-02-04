-- Add UPDATE policy for reading_history table
CREATE POLICY "Users can update own reading history"
ON public.reading_history
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);