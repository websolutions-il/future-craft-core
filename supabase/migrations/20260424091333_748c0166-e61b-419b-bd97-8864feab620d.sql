-- Allow anonymous uploads into the declarations/ folder of the documents bucket
CREATE POLICY "Anonymous can upload declaration signatures"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'declarations'
);

-- Allow anonymous reads of the declarations/ folder so signatures can be displayed back
CREATE POLICY "Anonymous can view declaration signatures"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'declarations'
);