'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/server/db/supabaseClient';
import layoutStyles from '@/styles/layout.module.css';

// Basit stil tanımları (veya module.css kullanabilirsiniz)
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  th: {
    textAlign: 'left' as const,
    padding: '1rem',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: '600',
    color: '#374151',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
  },
  image: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    backgroundColor: '#f3f4f6',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '500',
  }
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hizmetleri Çek
  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabaseClient
        .from('services')
        .select('*')
        .order('name', { ascending: true }); // İsme göre sırala

      if (!error && data) {
        setServices(data);
      }
      setLoading(false);
    }
    fetchServices();
  }, []);

  if (loading) return <div className={layoutStyles.container} style={{padding:'2rem'}}>Yükleniyor...</div>;

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        {/* Üst Başlık ve Buton */}
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Hizmetler</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Toplam {services.length} hizmet listeleniyor</p>
          </div>
          <Link href="/admin/services/new" style={styles.addButton}>
            + Yeni Hizmet Ekle
          </Link>
        </div>

        {/* Tablo */}
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Görsel</th>
                <th style={styles.th}>Hizmet Adı</th>
                <th style={styles.th}>Süre</th>
                <th style={styles.th}>Fiyat</th>
                <th style={styles.th}>Durum</th>
                <th style={styles.th}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Henüz hizmet eklenmemiş.</td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id}>
                    <td style={styles.td}>
                      {service.image_url ? (
                        <img src={service.image_url} alt={service.name} style={styles.image} />
                      ) : (
                        <div style={{...styles.image, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.75rem'}}>No</div>
                      )}
                    </td>
                    <td style={{...styles.td, fontWeight: '500', color: '#111827'}}>{service.name}</td>
                    <td style={styles.td}>{service.duration_min} dk</td>
                    <td style={{...styles.td, fontWeight: '600'}}>{service.price_min} ₺</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: service.active ? '#dcfce7' : '#f3f4f6',
                        color: service.active ? '#166534' : '#6b7280'
                      }}>
                        {service.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <Link 
                        href={`/admin/services/${service.id}/edit`}
                        style={{ color: 'var(--color-primary)', fontWeight: '500', textDecoration: 'none' }}
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}