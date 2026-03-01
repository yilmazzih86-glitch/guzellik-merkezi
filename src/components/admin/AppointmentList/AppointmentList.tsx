// src/components/admin/AppointmentList/AppointmentList.tsx

import React from 'react';
import styles from './AppointmentList.module.css';
import { AppointmentWithDetails } from '@/types/custom'; // 1. adımda oluşturduğumuz özel tip

interface Props {
  appointments: AppointmentWithDetails[];
}

export default function AppointmentList({ appointments }: Props) {
  
  // Saat formatlayıcı (Örn: 14:30)
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Tarih formatlayıcı (Örn: 12 Mart)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
    });
  };

  // Durum etiketi çevirici (İngilizce -> Türkçe)
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'Onaylı',
      cancelled: 'İptal',
      completed: 'Tamamlandı',
      no_show: 'Gelmedi'
    };
    return map[status] || status;
  };

  // Veri yoksa gösterilecek mesaj
  if (!appointments || appointments.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
        Henüz kayıtlı bir randevu bulunmuyor.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Zaman</th>
            <th>Müşteri</th>
            <th>Hizmet</th>
            <th>Durum</th>
            <th>Fiyat</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((app) => (
            <tr key={app.id} className={styles.row}>
              {/* Zaman Sütunu */}
              <td>
                <div style={{ fontWeight: 'bold' }}>{formatTime(app.start_at)}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>{formatDate(app.start_at)}</div>
              </td>

              {/* Müşteri Sütunu */}
              <td>
                <span className={styles.customerName}>
                    {app.customers?.full_name || 'İsimsiz Müşteri'}
                </span>
                <span className={styles.customerPhone}>
                    {app.customers?.phone || '-'}
                </span>
              </td>

              {/* Hizmet Sütunu */}
              <td>
                {app.services?.name || 'Hizmet Silinmiş'}
                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                    {app.services?.duration_min ? `${app.services.duration_min} dk` : ''}
                </div>
              </td>

              {/* Durum Sütunu */}
              <td>
                <span className={`${styles.badge} ${styles[app.status]}`}>
                  {getStatusLabel(app.status)}
                </span>
              </td>

              {/* Fiyat Sütunu */}
              <td>
                {app.price_at_booking ? (
                    <span style={{ fontWeight: 500 }}>₺{app.price_at_booking}</span>
                ) : (
                    <span style={{ color: '#ccc' }}>-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}