"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/server/db/supabaseClient';
import { 
  format, 
  startOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks, 
  isSameDay, 
  parseISO, 
  differenceInMinutes,
  startOfDay,
  setHours,
  setMinutes
} from 'date-fns';
import { tr } from 'date-fns/locale';
import styles from './CalendarTimeline.module.css';

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

export default function CalendarTimeline() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // --- FIX 1: Supabase istemcisini hafızada tut (Loop'u engeller) ---
  const supabase = useMemo(() => createClient(), []);

  // Takvim Ayarları
  const START_HOUR = 9;
  const END_HOUR = 20;
  const SLOT_DURATION = 30; // 30 dakikalık dilimler
  const TOTAL_SLOTS = (END_HOUR - START_HOUR) * (60 / SLOT_DURATION);

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const startISO = startDate.toISOString();
    const endISO = addDays(startDate, 7).toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, start_at, end_at, status,
        customers (full_name, phone),
        services (name),
        staff (name)
      `)
      .gte('start_at', startISO)
      .lt('start_at', endISO);

    if (error) console.error('Veri hatası:', error);
    else setAppointments(data as any || []);
    
    setLoading(false);
  }, [startDate, supabase]); // supabase artık stabil

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getGridPosition = (start: string, end: string) => {
    const sDate = parseISO(start);
    const eDate = parseISO(end);
    
    // Günün 09:00'una göre kaçıncı dakikada?
    const dayStart = setMinutes(setHours(startOfDay(sDate), START_HOUR), 0);
    const diffStart = differenceInMinutes(sDate, dayStart);
    const duration = differenceInMinutes(eDate, sDate);

    // Grid Row hesaplama (+2 header payı)
    const startRow = Math.floor(diffStart / SLOT_DURATION) + 2; 
    const span = Math.ceil(duration / SLOT_DURATION);

    return {
      gridRowStart: startRow,
      gridRowEnd: `span ${span}`,
    };
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      case 'completed': return styles.statusCompleted;
      default: return styles.statusDefault;
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <button className={styles.navButton} onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>&lt; Önceki</button>
        <h2 className={styles.title}>
          {format(startDate, 'd MMMM', { locale: tr })} - {format(addDays(startDate, 6), 'd MMMM yyyy', { locale: tr })}
        </h2>
        <button className={styles.navButton} onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>Sonraki &gt;</button>
      </div>

      {/* GRID */}
      <div className={styles.gridContainer}>
        
        {/* --- FIX 2: SAATLERİ DOĞRUDAN GRID'E KOYUYORUZ (Wrapper yok) --- */}
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
          // Referans saati hesapla
          const timeBase = setMinutes(setHours(startOfDay(new Date()), START_HOUR), 0);
          const slotTime = new Date(timeBase.getTime() + i * SLOT_DURATION * 60000);
          
          // Sadece saat başlarını göster (Opsiyonel: i % 2 === 0)
          const isFullHour = i % 2 === 0; 
          
          return (
            <div 
              key={`time-${i}`} 
              className={styles.timeSlot} 
              style={{ 
                gridColumn: 1,      // Hepsi 1. sütunda
                gridRow: i + 2      // Header (1) + Sıra
              }}
            >
              {isFullHour && format(slotTime, 'HH:mm')}
            </div>
          );
        })}

        {/* GÜN BAŞLIKLARI (Header) */}
        {weekDays.map((day, i) => (
          <div key={`day-${i}`} className={`${styles.dayHeader} ${isSameDay(day, new Date()) ? styles.today : ''}`} style={{ gridColumn: i + 2, gridRow: 1 }}>
            <div className={styles.dayName}>{format(day, 'EEEE', { locale: tr })}</div>
            <div className={styles.dayDate}>{format(day, 'd MMM', { locale: tr })}</div>
          </div>
        ))}

        {/* ARKAPLAN ÇİZGİLERİ (Izgara) */}
        {/* Dikey Çizgiler */}
        {weekDays.map((_, colIndex) => (
           <div 
             key={`col-line-${colIndex}`} 
             className={styles.gridColumnLine}
             style={{ 
               gridColumn: colIndex + 2, 
               gridRow: `2 / span ${TOTAL_SLOTS}` 
             }} 
           ></div>
        ))}
        
        {/* Yatay Çizgiler (Her saat başı için) */}
         {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
           <div
            key={`row-line-${i}`}
            className={styles.gridRowLine}
            style={{
              gridColumn: '2 / span 7', // Tüm günleri kapsa
              gridRow: i + 2
            }}
           ></div>
         ))}

        {/* RANDEVU KARTLARI */}
        {!loading && appointments.map((apt) => {
          const aptDate = parseISO(apt.start_at);
          // Hangi gün? (Pzt=0 -> Grid col=2)
          const dayIndex = (aptDate.getDay() + 6) % 7; 
          const gridCol = dayIndex + 2; 
          const position = getGridPosition(apt.start_at, apt.end_at);

          return (
            <div
              key={apt.id}
              className={`${styles.eventCard} ${getStatusClass(apt.status)}`}
              style={{ gridColumn: gridCol, ...position }}
              onClick={() => setSelectedAppointment(apt)}
            >
              <div className={styles.eventTitle}>{apt.customers?.full_name || 'İsimsiz'}</div>
              <div className={styles.eventService}>{apt.services?.name}</div>
              <div className={styles.eventTime}>{format(aptDate, 'HH:mm')}</div>
            </div>
          );
        })}
      </div>

      {/* MODAL (Aynı kaldı) */}
      {selectedAppointment && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAppointment(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Randevu Detayı</h3>
            <div className={styles.modalBody}>
                <p><strong>Müşteri:</strong> {selectedAppointment.customers?.full_name}</p>
                <p><strong>Hizmet:</strong> {selectedAppointment.services?.name}</p>
                <p><strong>Tarih:</strong> {format(parseISO(selectedAppointment.start_at), 'd MMMM HH:mm', { locale: tr })}</p>
                <div className={styles.badgeWrapper}>
                   <span className={`${styles.statusBadge} ${getStatusClass(selectedAppointment.status)}`}>
                     {selectedAppointment.status}
                   </span>
                </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeButton} onClick={() => setSelectedAppointment(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}