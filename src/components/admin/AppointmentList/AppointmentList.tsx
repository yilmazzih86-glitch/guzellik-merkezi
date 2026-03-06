// src/components/admin/AppointmentList/AppointmentList.tsx

import React from 'react';
import Link from 'next/link'; // Link importu
import styles from './AppointmentList.module.css';
import { AppointmentWithDetails } from '@/types/custom';

interface Props {
  appointments: AppointmentWithDetails[];
  viewMode?: 'dashboard' | 'customer-detail'; // Görünüm modu
}

export default function AppointmentList({ appointments, viewMode = 'dashboard' }: Props) {
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'Onaylı',
      pending: 'Onay Bekliyor',
      cancelled: 'İptal',
      completed: 'Tamamlandı',
      no_show: 'Gelmedi'
    };
    return map[status] || status;
  };

  const renderCustomerBadge = (visitCount?: number | null, totalSpend?: number | null) => {
    const count = visitCount || 0;
    const spend = totalSpend || 0;
    if (count <= 1) return <span style={{ fontSize: '0.7rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Yeni</span>;
    if (spend > 5000) return <span style={{ fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>VIP</span>;
    return <span style={{ fontSize: '0.7rem', color: '#666', marginLeft: '6px' }}>({count}. Ziyaret)</span>;
  };

  if (!appointments || appointments.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Kayıt bulunamadı.</div>;
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            {/* Dashboard'da sadece saat yeterli, Detayda TARİH şart */}
            <th>{viewMode === 'dashboard' ? 'Saat' : 'Tarih & Saat'}</th>
            
            {/* Dashboard'da Müşteri şart, Detayda GEREKSİZ */}
            {viewMode === 'dashboard' && <th>Müşteri</th>}
            
            <th>Hizmet</th>
            <th>Uzman</th> {/* Yeni Sütun */}
            <th>Durum</th>
            <th>Fiyat</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((app) => (
            <tr key={app.id} className={styles.row}>
              
              {/* ZAMAN SÜTUNU */}
              <td>
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {formatTime(app.start_at)}
                </div>
                {viewMode === 'customer-detail' && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {formatDate(app.start_at)}
                    </div>
                )}
              </td>

              {/* MÜŞTERİ SÜTUNU (Sadece Dashboard) */}
              {viewMode === 'dashboard' && (
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link 
                      href={`/admin/customers/${app.customer_id}`} 
                      className={styles.customerName}
                      style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#ddd' }}
                    >
                        {app.customers?.full_name || 'Misafir'}
                    </Link>
                    {renderCustomerBadge(app.customers?.visit_count, app.customers?.total_spend)}
                  </div>
                  <div className={styles.customerPhone}>{app.customers?.phone}</div>
                </td>
              )}

              {/* HİZMET SÜTUNU */}
              <td>
                {app.services?.name}
                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                    {app.services?.duration_min} dk
                </div>
              </td>

              {/* UZMAN SÜTUNU (Yeni) */}
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>👨‍⚕️</span>
                    <span style={{ fontWeight: 500 }}>{app.staff?.name || '-'}</span>
                </div>
              </td>

              {/* DURUM */}
              <td>
                <span className={`${styles.badge} ${styles[app.status]}`}>
                  {getStatusLabel(app.status)}
                </span>
              </td>

              {/* FİYAT */}
              <td>
                {app.price_at_booking ? `₺${app.price_at_booking}` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}