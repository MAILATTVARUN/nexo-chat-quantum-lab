
-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload chat files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

-- Create policy to allow users to view chat files
CREATE POLICY "Allow users to view chat files" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-files');

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own chat files" ON storage.objects
FOR DELETE USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);
