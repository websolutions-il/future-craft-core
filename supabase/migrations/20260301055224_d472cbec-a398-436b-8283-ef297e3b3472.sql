
-- Storage RLS policies for the documents bucket
-- Allow authenticated users to upload files to their company folder
CREATE POLICY "Users can upload documents to own company folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = get_user_company(auth.uid())
);

-- Allow users to view documents from their own company (or super_admin sees all)
CREATE POLICY "Users can view own company documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] = get_user_company(auth.uid())
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

-- Allow managers and super_admins to delete documents
CREATE POLICY "Managers can delete own company documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND (storage.foldername(name))[1] = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);
