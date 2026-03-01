// src/app/admin/staff/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/server/db/supabaseClient'; // Client-side client
import layoutStyles from '@/styles/layout.module.css';
import styles from './StaffForm.module.css';

export default function NewStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    image_url: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Validasyon
    if (!formData.name.trim()) {
      setError('Lütfen bir isim giriniz.');
      setLoading(false);
      return;
    }

    try {
      // 2. Supabase Insert İşlemi
      const { error: dbError } = await supabaseClient
        .from('staff')
        .insert([
          {
            name: formData.name,
            title: formData.title || null,
            image_url: formData.image_url || null,
            active: formData.active,
            // availability varsayılan olarak boş JSON gider
          },
        ]);

      if (dbError) throw dbError;

      // 3. Başarılıysa Listeye Dön
      router.push('/admin/staff');
      router.refresh(); // Listeyi yenilemesi için
      
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

              {/* Resim URL (Şimdilik manuel giriş, ileride upload yapılabilir) */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="image_url">Profil Fotoğrafı (URL)</label>
                <input
                  id="image_url"
                  type="url"
                  className={styles.input}
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                  Not: Şimdilik buraya bir resim linki yapıştırın. Dosya yükleme özelliği Faz 2'de eklenecek.
                </p>
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