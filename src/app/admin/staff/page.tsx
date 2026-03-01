// src/app/admin/staff/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/server/db/supabaseClient';
import { Card } from '@/components/ui/Card/Card';
import layoutStyles from '@/styles/layout.module.css';
import styles from './Staff.module.css';

interface Staff {
  id: string;
  name: string;
  title: string | null;
  image_url: string | null;
  active: boolean;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setStaffList(data || []);
    } catch (err: any) {
      console.error('Veri çekme hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={layoutStyles.container}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={layoutStyles.container}>
        <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>
          Hata: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        {/* Başlık ve Ekle Butonu */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Uzman Kadrosu</h1>
            <p style={{ color: '#666', marginTop: '0.25rem' }}>
              Personel listesi ve çalışma saatleri yönetimi
            </p>
          </div>
          <Link href="/admin/staff/new" className={styles.addButton}>
            + Yeni Uzman Ekle
          </Link>
        </header>

        {/* Personel Listesi Grid */}
        <div className={styles.grid}>
          {staffList.map((staff) => (
            <Card key={staff.id} className={styles.staffCard}>
              
              {/* Aktiflik Durumu */}
              <div 
                className={`${styles.statusBadge} ${staff.active ? styles.active : styles.inactive}`} 
                title={staff.active ? 'Aktif' : 'Pasif'}
              />

              <div className={styles.cardHeader}>
                {staff.image_url ? (
                  <img src={staff.image_url} alt={staff.name} className={styles.avatarPlaceholder} style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className={styles.info}>
                  <h3>{staff.name}</h3>
                  <span className={styles.role}>{staff.title || 'Uzman'}</span>
                </div>
              </div>

              {/* BUTONLAR (GÜNCELLENEN KISIM) */}
              <div className={styles.actions}>
                <Link href={`/admin/staff/${staff.id}/availability`} className={styles.actionBtn}>
                  🕒 Çalışma Saatleri
                </Link>
                
                {/* Artık button değil, çalışan bir Link */}
                <Link href={`/admin/staff/${staff.id}/edit`} className={styles.actionBtn}>
                  ✏️ Düzenle
                </Link>
              </div>
            </Card>
          ))}

          {/* Liste Boşsa */}
          {staffList.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Henüz personel eklenmemiş</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Randevu sistemini kullanmak için en az bir uzman eklemelisiniz.</p>
              <Link href="/admin/staff/new" className={styles.addButton}>
                İlk Uzmanı Ekle
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}