'use client';

import React, { useState, useMemo } from 'react';
import styles from './CalendarTimeline.module.css';

interface Appointment {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  customer: { full_name: string; phone: string };
  service: { name: string; duration_min: number };
  staff: { name: string } | null;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 - 22:00

export default function CalendarTimeline({ appointments }: { appointments: Appointment[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1));
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const getGridPosition = (startAt: string, duration: number) => {
    const date = new Date(startAt);
    const startRow = (date.getHours() - 8) * 2 + (date.getMinutes() >= 30 ? 2 : 1);
    const rowSpan = Math.ceil(duration / 30);
    return { startRow, rowSpan };
  };

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.calendarHeader}>
        <div className={styles.navGroup}>
          <button className={styles.navBtn} onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}>‹</button>
          <h2 className={styles.currentMonth}>{weekDays[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</h2>
          <button className={styles.navBtn} onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}>›</button>
        </div>
        <button className={styles.todayBtn} onClick={() => setCurrentDate(new Date())}>Bugün</button>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.daysRow}>
          <div className={styles.timeLabelCell}></div>
          {weekDays.map((day, i) => (
            <div key={i} className={`${styles.dayHeader} ${day.toDateString() === new Date().toDateString() ? styles.today : ''}`}>
              <span className={styles.dayName}>{day.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
              <span className={styles.dayNumber}>{day.getDate()}</span>
            </div>
          ))}
        </div>

        <div className={styles.timelineBody}>
          <div className={styles.timeColumn}>
            {HOURS.map(h => <div key={h} className={styles.hourCell}>{h}:00</div>)}
          </div>
          <div className={styles.gridBody}>
            {appointments.map(app => {
              const dayIdx = weekDays.findIndex(d => d.toDateString() === new Date(app.start_at).toDateString());
              if (dayIdx === -1) return null;
              const { startRow, rowSpan } = getGridPosition(app.start_at, app.service.duration_min);
              return (
                <div key={app.id} className={`${styles.appointmentCard} ${styles[app.status]}`} 
                     style={{ gridColumn: dayIdx + 1, gridRowStart: startRow, gridRowEnd: `span ${rowSpan}` }}
                     onClick={() => setSelectedApp(app)}>
                  <span className={styles.appCustomer}>{app.customer.full_name}</span>
                  <span className={styles.appService}>{app.service.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedApp && (
        <div className={styles.modalOverlay} onClick={() => setSelectedApp(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedApp(null)}>✕</button>
            <h3 className={styles.modalTitle}>Randevu Detayı</h3>
            <div className={styles.modalBody}>
              <p><strong>Danışan:</strong> {selectedApp.customer.full_name}</p>
              <p><strong>Telefon:</strong> {selectedApp.customer.phone}</p>
              <p><strong>Hizmet:</strong> {selectedApp.service.name}</p>
              <p><strong>Uzman:</strong> {selectedApp.staff?.name || 'Atanmadı'}</p>
              <p><strong>Saat:</strong> {new Date(selectedApp.start_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}