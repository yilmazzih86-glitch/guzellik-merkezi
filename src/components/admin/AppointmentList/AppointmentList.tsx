// src/components/admin/AppointmentList/AppointmentList.tsx
'use client'; 

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import styles from './AppointmentList.module.css';
import { AppointmentWithDetails } from '@/types/custom';

interface Props {
  appointments: AppointmentWithDetails[];
  viewMode?: string;
  onUpdate?: () => void; 
}

export default function AppointmentList({ appointments, viewMode, onUpdate }: Props) {
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
      
      if (onUpdate) onUpdate(); // Ana sayfadaki tetikleyiciyi ateşler
      router.refresh(); 
    } catch (error) {
      alert('İşlem başarısız oldu.');
    } finally {
      setLoadingId(null);
    }
  };

  // --- TANSTACK TABLE YAPILANDIRMASI ---
  const columnHelper = createColumnHelper<AppointmentWithDetails>();

  // Sütunları useMemo ile sarmalıyoruz ki gereksiz re-render (döngü) olmasın
  const columns = useMemo(() => [
    
    // 1. SÜTUN: Tarih & Saat
    columnHelper.accessor('start_at', {
      header: 'Tarih & Saat',
      cell: (info) => {
        const val = info.getValue();
        const dateObj = new Date(val);
        const time = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const date = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        return (
          <div className={styles.dateTimeCell}>
            <span className={styles.time}>{time}</span>
            <span className={styles.date}>{date}</span>
          </div>
        );
      },
    }),

    // 2. SÜTUN: Müşteri
    columnHelper.accessor(row => row.customers, {
      id: 'customer',
      header: 'Müşteri',
      cell: (info) => {
        const customer = info.getValue();
        const rowId = info.row.original.customer_id;
        return (
          <div className={styles.customerCell}>
            <Link href={`/admin/customers/${rowId}`} className={styles.customerName}>
              {customer?.full_name || 'Misafir'}
            </Link>
            <span className={styles.customerPhone}>{customer?.phone || '-'}</span>
          </div>
        );
      }
    }),

    // 3. SÜTUN: Hizmet & Personel
    columnHelper.accessor(row => row, {
      id: 'service_staff',
      header: 'Hizmet / Personel',
      cell: (info) => {
        const row = info.getValue();
        return (
          <div className={styles.serviceCell}>
            <span className={styles.serviceName}>{row.services?.name}</span>
            <span className={styles.staffName}>{row.staff?.name ? `Uzman: ${row.staff.name}` : ''}</span>
          </div>
        );
      }
    }),

    // 4. SÜTUN: Durum
    columnHelper.accessor('status', {
      header: 'Durum',
      cell: (info) => {
        const status = info.getValue();
        const labels: Record<string, string> = {
          confirmed: 'ONAYLI',
          pending: 'BEKLİYOR',
          completed: 'TAMAMLANDI',
          no_show: 'GELMEDİ',
          cancelled: 'İPTAL'
        };
        return (
          <span className={`${styles.statusBadge} ${styles[status]}`}>
            {labels[status] || status}
          </span>
        );
      }
    }),

    // 5. SÜTUN: Aksiyonlar (İşlemler)
    columnHelper.display({
      id: 'actions',
      header: 'İşlemler',
      cell: (info) => {
        const app = info.row.original;
        const isActionable = ['pending', 'confirmed'].includes(app.status);
        const isLoading = loadingId === app.id;

        if (!isActionable) {
          return <div className={styles.lockedState}>🔒 Kapalı</div>;
        }

        return (
          <div className={styles.buttonsWrapper}>
            <button 
              onClick={() => handleStatusUpdate(app.id, 'completed')}
              disabled={isLoading}
              className={`${styles.actionBtn} ${styles.btnSuccess}`}
              title="Geldi"
            >✓</button>
            <button 
              onClick={() => handleStatusUpdate(app.id, 'no_show')}
              disabled={isLoading}
              className={`${styles.actionBtn} ${styles.btnWarning}`}
              title="Gelmedi"
            >!</button>
            <button 
              onClick={() => handleStatusUpdate(app.id, 'cancelled')}
              disabled={isLoading}
              className={`${styles.actionBtn} ${styles.btnDanger}`}
              title="İptal"
            >✕</button>
          </div>
        );
      }
    })
  ], [loadingId]);

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!appointments || appointments.length === 0) {
    return <div className={styles.emptyState}>Gösterilecek randevu bulunamadı.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}