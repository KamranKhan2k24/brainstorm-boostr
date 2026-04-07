CREATE TABLE public.generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  niche TEXT NOT NULL,
  platform TEXT NOT NULL,
  style TEXT NOT NULL,
  audience TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content" ON public.generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own content" ON public.generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content" ON public.generated_content FOR DELETE USING (auth.uid() = user_id);