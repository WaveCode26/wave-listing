-- =====================================================
-- WAVE LISTING — Storage Buckets
-- =====================================================

-- Bucket para imagens originais dos produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff']
);

-- Bucket para imagens processadas (fundo branco, lifestyle, infográficos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'processed-images',
  'processed-images',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- =====================================================
-- STORAGE RLS — apenas membros da organização acessam
-- =====================================================

CREATE POLICY "members_upload_product_images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "members_read_product_images" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('product-images', 'processed-images') AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "members_delete_product_images" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('product-images', 'processed-images') AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "members_upload_processed_images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'processed-images' AND
    auth.uid() IS NOT NULL
  );
