// src/components/admin/Calendar/CalendarMonthly.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/server/db/supabaseClient';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  parseISO, 
  addDays 
} from 'date-fns';
import { tr } from 'date-fns/locale';
import styles from './CalendarMonthly.module.css';

// Tip Tanımları
type Appointment = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  customers: { full_name: string; phone: string } | null;
  services: { name: string } | null;
  staff: { name: string } | null;
};

interface Props {
  refreshTrigger?: number;
  onUpdate?: () => void;
}

export default function CalendarMonthly({ refreshTrigger = 0, onUpdate }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // Ayın başı ve sonu, takvimin tablosu için haftanın başı ve sonu
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);
  const startDate = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const endDate = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 1 }), [monthEnd]);

  // Döngü sızıntılarını önlemek için metne çeviriyoruz
  const startDateISO = startDate.toISOString();
  const endDateISO = endDate.toISOString();

  // Veri Çekme İşlemi
  const fetchAppointments = useCallback(async () => {
    let isMounted = true;
    setLoading(true);

    // Ay görünümünde ekranda görünen ilk günden (geçen ayın son günleri olabilir) 
    // son güne (gelecek ayın ilk günleri) kadar olan tüm randevuları çeker.
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, start_at, end_at, status,
        customers (full_name, phone),
        services (name),
        staff (name)
      `)
      .gte('start_at', startDateISO)
      .lte('start_at', endDateISO);

    if (error) {
      console.error('Aylık takvim veri hatası:', error);
    } else if (isMounted) {
      setAppointments(data as any || []);
    }
    
    if (isMounted) setLoading(false);
    return () => { isMounted = false };
  }, [startDateISO, endDateISO, supabase, refreshTrigger]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Aksiyon Güncellemesi (Geldi / İptal vb.)
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const messages: Record<string, string> = {
      completed: 'Bu randevuyu TAMAMLANDI (Geldi) olarak işaretlemek istediğinize emin misiniz?',
      no_show: 'Bu müşteriyi GELMEDİ olarak işaretlemek istediğinize emin misiniz?',
      cancelled: 'Bu randevuyu İPTAL etmek istediğinize emin misiniz?'
    };

    if (!confirm(messages[newStatus] || 'İşlemi onaylıyor musunuz?')) return;

    setActionLoadingId(id);
    try {
      const res = await fetch('/api/appointments/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Hata oluştu');
      
      setSelectedAppointment(null);
      fetchAppointments(); 
      if (onUpdate) onUpdate(); 
    } catch (error) {
      alert('İşlem başarısız oldu.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Takvim Günlerini Oluşturma
  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Sınıf ve Etiket Yardımcıları
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      case 'completed': return styles.statusCompleted;
      case 'no_show': return styles.statusNoShow;
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'ONAYLI';
      case 'pending': return 'BEKLİYOR';
      case 'completed': return 'TAMAMLANDI';
      case 'no_show': return 'GELMEDİ';
      case 'cancelled': return 'İPTAL';
      default: return status;
    }
  };

  const weekDaysHeader = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <button className={styles.navButton} onClick={() => setCurrentDate(subMonths(currentDate, 1))}>&lt; Önceki Ay</button>
        <h2 className={styles.title}>
          {format(monthStart, 'MMMM yyyy', { locale: tr })}
        </h2>
        <button className={styles.navButton} onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Sonraki Ay &gt;</button>
      </div>

      {/* AYLIK GRID */}
      <div className={styles.gridContainer}>
        {/* Gün İsimleri (Pzt, Sal...) */}
        {weekDaysHeader.map((dayName, index) => (
          <div key={`header-${index}`} className={styles.dayNameHeader}>
            {dayName}
          </div>
        ))}

        {/* Takvim Hücreleri */}
        {days.map((dayItem, index) => {
          // Bu güne ait randevuları filtrele
          const dailyAppointments = appointments.filter(apt => isSameDay(parseISO(apt.start_at), dayItem));
          // Tarih saati sırala
          dailyAppointments.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

          return (
            <div 
              key={`day-${index}`} 
              className={`
                ${styles.dayCell} 
                ${!isSameMonth(dayItem, monthStart) ? styles.otherMonth : ''} 
                ${isSameDay(dayItem, new Date()) ? styles.today : ''}
              `}
            >
              <div className={styles.dateNumber}>
                {format(dayItem, 'd')}
              </div>
              
              <div className={styles.eventList}>
                {loading ? null : dailyAppointments.map((apt) => (
                  <div 
                    key={apt.id} 
                    className={`${styles.eventPill} ${getStatusClass(apt.status)}`}
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    <span className={styles.eventTime}>{format(parseISO(apt.start_at), 'HH:mm')}</span>
                    <span className={styles.eventTitle}>{apt.customers?.full_name || 'Misafir'}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL (Haftalık takvim ile tamamen aynı UI) */}
      {selectedAppointment && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAppointment(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Randevu Detayı</h3>
            <div className={styles.modalBody}>
                <p><strong>Müşteri:</strong> <span>{selectedAppointment.customers?.full_name || 'Misafir'}</span></p>
                <p><strong>Telefon:</strong> <span>{selectedAppointment.customers?.phone || '-'}</span></p>
                <p><strong>Hizmet:</strong> <span>{selectedAppointment.services?.name}</span></p>
                <p><strong>Personel:</strong> <span>{selectedAppointment.staff?.name || '-'}</span></p>
                <p><strong>Tarih:</strong> <span>{format(parseISO(selectedAppointment.start_at), 'd MMMM yyyy - HH:mm', { locale: tr })}</span></p>
                
                <div className={styles.badgeWrapper}>
                   <span className={`${styles.statusBadge} ${getStatusClass(selectedAppointment.status)}`}>
                     {getStatusLabel(selectedAppointment.status)}
                   </span>
                </div>
            </div>
            
            <div className={styles.modalFooter}>
              <div className={styles.modalActions}>
                {['pending', 'confirmed'].includes(selectedAppointment.status) && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                      disabled={actionLoadingId === selectedAppointment.id}
                      className={`${styles.actionBtn} ${styles.btnSuccess}`}
                      title="Geldi"
                    >✓</button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'no_show')}
                      disabled={actionLoadingId === selectedAppointment.id}
                      className={`${styles.actionBtn} ${styles.btnWarning}`}
                      title="Gelmedi"
                    >!</button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                      disabled={actionLoadingId === selectedAppointment.id}
                      className={`${styles.actionBtn} ${styles.btnDanger}`}
                      title="İptal"
                    >✕</button>
                  </>
                )}
              </div>
              <button className={styles.closeButton} onClick={() => setSelectedAppointment(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}