// src/app/admin/staff/[id]/edit/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabaseClient } from '@/server/db/supabaseClient';
import layoutStyles from '@/styles/layout.module.css';
// Tasarım tutarlılığı için 'new' klasöründeki CSS'i kullanıyoruz.
// Eğer import hatası verirse yolu kontrol edin.
import styles from '../../new/StaffForm.module.css';

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Verileri
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    image_url: '',
    active: true,
  });

  // 1. Mevcut Veriyi Çek (Pre-fill)
  useEffect(() => {
    const fetchStaff = async () => {
      if (!staffId) return;
      
      const { data, error } = await supabaseClient
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single();

      if (error) {
        setError('Personel bilgisi alınamadı.');
      } else if (data) {
        setFormData({
          name: data.name,
          title: data.title || '',
          image_url: data.image_url || '',
          active: data.active,
        });
      }
      setLoading(false);
    };

    fetchStaff();
  }, [staffId]);

  // 2. Güncelleme İşlemi
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { error } = await supabaseClient
        .from('staff')
        .update({
          name: formData.name,
          title: formData.title || null,
          image_url: formData.image_url || null,
          active: formData.active,
        })
        .eq('id', staffId);

      if (error) throw error;

      alert('Personel bilgileri güncellendi.');
      router.push('/admin/staff'); // Listeye dön
      router.refresh(); // Verileri tazele

    } catch (err: any) {
      alert('Güncelleme hatası: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Silme İşlemi
  const handleDelete = async () => {
    const confirmDelete = confirm(
      'DİKKAT: Bu personeli silmek istediğinize emin misiniz?\n\nEğer bu personelin geçmiş randevuları varsa silme işlemi hata verebilir. Bunun yerine personeli "Pasif" yapmanız önerilir.'
    );
    
    if (!confirmDelete) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabaseClient
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      alert('Personel silindi.');
      router.push('/admin/staff');
      router.refresh();

    } catch (err: any) {
      console.error(err);
      // Foreign Key hatası (Code 23503) kontrolü
      if (err.code === '23503') {
        alert('HATA: Bu personelin kayıtlı randevuları olduğu için SİLEMEZSİNİZ.\n\nLütfen bunun yerine "Aktif" kutucuğunun işaretini kaldırarak personeli pasife alın.');
      } else {
        alert('Silme hatası: ' + err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={layoutStyles.container}>
        <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={layoutStyles.container} style={{ color: 'red', padding: '2rem' }}>
        Hata: {error}
      </div>
    );
  }

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        <div className={styles.container}>
          <div className={styles.formCard}>
            
            {/* Başlık ve Sil Butonu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h1 className={styles.title} style={{ marginBottom: 0 }}>Uzmanı Düzenle</h1>
               <button 
                 type="button" 
                 onClick={handleDelete}
                 style={{ 
                   background: '#fee2e2', 
                   border: '1px solid #fca5a5', 
                   color: '#991b1b', 
                   cursor: 'pointer', 
                   fontSize: '0.8rem',
                   padding: '0.5rem 1rem',
                   borderRadius: '6px',
                   fontWeight: 600
                 }}
               >
                 🗑️ Personeli Sil
               </button>
            </div>

            <form onSubmit={handleUpdate}>
              
              {/* İsim */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Ad Soyad</label>
                <input
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Ünvan */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Ünvan</label>
                <input
                  className={styles.input}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Resim */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Profil Fotoğrafı (URL)</label>
                <input
                  className={styles.input}
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              {/* Aktiflik Durumu */}
              <div className={styles.checkboxGroup} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  id="activeCheck"
                />
                <label htmlFor="activeCheck" style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'block', fontWeight: 600, color: formData.active ? '#10b981' : '#6b7280' }}>
                    {formData.active ? 'PERSONEL AKTİF' : 'PERSONEL PASİF'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 400 }}>
                    {formData.active 
                      ? 'Bu personel randevu sisteminde görünür ve randevu alabilir.' 
                      : 'Bu personel randevu sisteminde GİZLENİR. (Eski kayıtlar silinmez)'}
                  </span>
                </label>
              </div>

              {/* Butonlar */}
              <div className={styles.actions}>
                <button 
                  type="button" 
                  onClick={() => router.back()} 
                  className={styles.cancelBtn}
                  disabled={submitting}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={submitting}
                >
                  {submitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}