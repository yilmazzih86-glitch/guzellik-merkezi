// src/components/admin/AppointmentList/AppointmentList.tsx
'use client'; 

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './AppointmentList.module.css';
import { AppointmentWithDetails } from '@/types/custom';

interface Props {
  appointments: AppointmentWithDetails[];
  viewMode?: string;
}

export default function AppointmentList({ appointments, viewMode }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // --- STATÜ GÜNCELLEME ---
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const messages: Record<string, string> = {
      completed: 'Bu randevuyu TAMAMLANDI (Geldi) olarak işaretlemek istediğinize emin misiniz?',
      no_show: 'Bu müşteriyi GELMEDİ olarak işaretlemek istediğinize emin misiniz?',
      cancelled: 'Bu randevuyu İPTAL etmek istediğinize emin misiniz?'
    };

    if (!confirm(messages[newStatus] || 'İşlemi onaylıyor musunuz?')) return;

    setLoadingId(id);
    try {
      const res = await fetch('/api/appointments/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Hata oluştu');
      
      router.refresh(); 
    } catch (error) {
      alert('İşlem başarısız oldu.');
    } finally {
      setLoadingId(null);
    }
  };

  // Formatlayıcılar
  const formatTime = (date: string) => new Date(date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: string) => new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Veri yoksa veya boşsa
  if (!appointments || appointments.length === 0) {
    return <div className={styles.emptyState}>Gösterilecek randevu bulunamadı.</div>;
  }

  return (
    <div className={styles.container}>
      {appointments.map((app) => {
        const isActionable = ['pending', 'confirmed'].includes(app.status);
        const isLoading = loadingId === app.id;

        return (
          <div key={app.id} className={styles.card}>
            
            {/* SOL: ZAMAN */}
            <div className={styles.timeBlock}>
              <div className={styles.time}>{formatTime(app.start_at)}</div>
              <div className={styles.date}>{formatDate(app.start_at)}</div>
            </div>

            {/* ORTA: DETAYLAR */}
            <div className={styles.detailsBlock}>
              <div className={styles.headerRow}>
                <Link href={`/admin/customers/${app.customer_id}`} className={styles.customerName}>
                  {app.customers?.full_name || 'Misafir'}
                </Link>
                <span className={`${styles.statusBadge} ${styles[app.status]}`}>
                  {app.status === 'confirmed' ? '• ONAYLI' : 
                   app.status === 'pending' ? '• BEKLİYOR' : 
                   app.status === 'completed' ? '• TAMAMLANDI' : 
                   app.status === 'no_show' ? '• GELMEDİ' : 
                   app.status === 'cancelled' ? '• İPTAL' : app.status}
                </span>
              </div>
              
              <div className={styles.subInfo}>
                <span>👤 {app.services?.name}</span>
                <span className={styles.phone}>📞 {app.customers?.phone}</span>
                {app.staff?.name && <span className={styles.staff}>👨‍⚕️ {app.staff.name}</span>}
              </div>
            </div>

            {/* SAĞ: BUTONLAR */}
            <div className={styles.actionsBlock}>
              {isActionable ? (
                <div className={styles.buttonsWrapper}>
                  <button 
                    onClick={() => handleStatusUpdate(app.id, 'completed')}
                    disabled={isLoading}
                    className={`${styles.circleBtn} ${styles.btnSuccess}`}
                    title="Geldi"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(app.id, 'no_show')}
                    disabled={isLoading}
                    className={`${styles.circleBtn} ${styles.btnWarning}`}
                    title="Gelmedi"
                  >
                    !
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                    disabled={isLoading}
                    className={`${styles.circleBtn} ${styles.btnDanger}`}
                    title="İptal"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className={styles.lockedState}>🔒 İşlem Kapalı</div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}