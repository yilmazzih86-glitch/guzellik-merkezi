'use client';

import React, { useState } from 'react';
// HATA BURADAYDI: createClient yerine supabaseClient'ı import ediyoruz
import { supabaseClient } from '@/server/db/supabaseClient'; 
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  value?: string | null;
  onUpload: (url: string) => void;
  folder?: string;
}

export default function ImageUploader({ value, onUpload, folder = 'uploads' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  
  // const supabase = createClient();  <-- BU SATIRA ARTIK GEREK YOK, supabaseClient'ı doğrudan kullanacağız.

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      // 1. Supabase Storage'a Yükle (Doğrudan supabaseClient kullanıyoruz)
      const { error: uploadError } = await supabaseClient.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Public URL'i al
      const { data } = supabaseClient.storage
        .from('images')
        .getPublicUrl(fileName);

      setPreview(data.publicUrl);
      onUpload(data.publicUrl);

    } catch (error: any) {
      alert('Resim yüklenirken hata oluştu: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.previewArea}>
        {uploading ? (
          <div className={styles.loading}>Yükleniyor...</div>
        ) : preview ? (
          <img src={preview} alt="Preview" className={styles.previewImage} />
        ) : (
          <span className={styles.placeholder}>+ Fotoğraf</span>
        )}
        
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className={styles.hiddenInput}
          disabled={uploading}
        />
      </label>
    </div>
  );
}