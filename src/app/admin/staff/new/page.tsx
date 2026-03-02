'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/server/db/supabaseClient'; 
import layoutStyles from '@/styles/layout.module.css';
import styles from './StaffForm.module.css';
// 1. ImageUploader'ı içe aktarıyoruz
import ImageUploader from '@/components/ui/ImageUploader/ImageUploader';

export default function NewStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Resim State'i (Sizin eklediğiniz kısım)
  const [imageUrl, setImageUrl] = useState<string>('');

  // Form State (image_url'i buradan sildik çünkü yukarıdaki state'i kullanacağız)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setError('Lütfen bir isim giriniz.');
      setLoading(false);
      return;
    }

    try {
      // 3. BURASI DEĞİŞTİ: JSON.stringify yerine doğrudan objeye yazıyoruz
      const { error: dbError } = await supabaseClient
        .from('staff')
        .insert([
          {
            name: formData.name,
            title: formData.title || null,
            image_url: imageUrl || null, // <--- İŞTE BURAYA YAZILIYOR
            active: formData.active,
            // availability varsayılan olarak boş JSON gider
          },
        ]);

      if (dbError) throw dbError;

      router.push('/admin/staff');
      router.refresh(); 
      
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.message || 'Beklenmedik bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        <div className={styles.container}>
          <div className={styles.formCard}>
            <h1 className={styles.title}>Yeni Uzman Ekle</h1>

            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* 4. Resim Yükleme Alanını En Üste Koyduk */}
              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                <ImageUploader 
                  folder="staff" 
                  onUpload={(url) => setImageUrl(url)} 
                />
              </div>

              {/* İsim Alanı */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">Ad Soyad *</label>
                <input
                  id="name"
                  type="text"
                  className={styles.input}
                  placeholder="Örn: Ayşe Yılmaz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Ünvan Alanı */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="title">Ünvan / Uzmanlık</label>
                <input
                  id="title"
                  type="text"
                  className={styles.input}
                  placeholder="Örn: Saç Tasarım Uzmanı"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Aktiflik Durumu */}
              <div className={styles.checkboxGroup}>
                <input
                  id="active"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="active" style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Bu personel randevu almaya açık (Aktif)
                </label>
              </div>

              {/* Butonlar */}
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={styles.cancelBtn}
                  disabled={loading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}