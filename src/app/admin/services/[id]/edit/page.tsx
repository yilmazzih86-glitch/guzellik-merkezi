'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabaseClient } from '@/server/db/supabaseClient'; 
import layoutStyles from '@/styles/layout.module.css';
import ImageUploader from '@/components/ui/ImageUploader/ImageUploader';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resim State
  const [imageUrl, setImageUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    duration_min: 30,
    price_min: 0,
    active: true,
  });

  // 1. Veriyi Çek
  useEffect(() => {
    async function fetchService() {
      if (!id) return;
      try {
        const { data, error } = await supabaseClient
          .from('services')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Hizmet bulunamadı.');

        setFormData({
          name: data.name,
          duration_min: data.duration_min,
          price_min: data.price_min,
          active: data.active,
        });
        setImageUrl(data.image_url || ''); // Mevcut resmi yükle

      } catch (err: any) {
        console.error('Veri hatası:', err);
        setError('Hizmet bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id]);

  // 2. Güncelle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabaseClient
        .from('services')
        .update({
          name: formData.name,
          duration_min: Number(formData.duration_min),
          price_min: Number(formData.price_min),
          image_url: imageUrl || null,
          active: formData.active,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      router.push('/admin/services');
      router.refresh();
      
    } catch (err: any) {
      console.error('Güncelleme hatası:', err);
      setError(err.message || 'Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={layoutStyles.container} style={{padding: '2rem'}}>Yükleniyor...</div>;

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          <div style={{ 
            background: '#fff', 
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Hizmet Düzenle</h1>

            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Hizmet Görseli</span>
                <ImageUploader 
                  folder="services" 
                  value={imageUrl} 
                  onUpload={(url) => setImageUrl(url)} 
                />
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* İsim */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>Hizmet Adı *</label>
                  <input
                    type="text"
                    style={{ padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', width: '100%' }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Süre */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>Süre (Dakika)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      style={{ padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', width: '100%' }}
                      value={formData.duration_min}
                      onChange={(e) => setFormData({ ...formData, duration_min: Number(e.target.value) })}
                    />
                  </div>

                  {/* Fiyat */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>Fiyat (TL)</label>
                    <input
                      type="number"
                      min="0"
                      style={{ padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', width: '100%' }}
                      value={formData.price_min}
                      onChange={(e) => setFormData({ ...formData, price_min: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Aktiflik */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', 
                  padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb'
                }}>
                  <input
                    id="active"
                    type="checkbox"
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <label htmlFor="active" style={{ cursor: 'pointer', fontWeight: '500', color: 'var(--color-text-main)' }}>
                    Bu hizmet randevuya açık
                  </label>
                </div>
              </div>

              {/* Butonlar */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{ padding: '0.875rem 2rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer' }}
                  disabled={saving}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '0.875rem 2rem', border: 'none', borderRadius: '0.5rem', background: 'var(--color-primary)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                  disabled={saving}
                >
                  {saving ? 'Değişiklikleri Kaydet' : 'Değişiklikleri Kaydet'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}