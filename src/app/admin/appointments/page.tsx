// src/app/admin/appointments/page.tsx
"use client";

import React, { useState } from 'react';
import CalendarTimeline from '@/components/admin/Calendar/CalendarTimeline';
import styles from './Appointments.module.css'; // Yeni CSS Modülü

export default function AppointmentsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>Randevu Takvimi</h1>
          <p className={styles.pageSubtitle}>Haftalık doluluk oranı ve randevu yönetimi</p>
        </div>
        
        <div className={styles.actionGroup}>
          <button 
            onClick={handleRefresh}
            className={`${styles.refreshButton} ${isRefreshing ? styles.spinning : ''}`}
            disabled={isRefreshing}
          >
            {/* SVG ikon kodu aynı kalabilir, sınıfları temizledik */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Yenile
          </button>

          <button className={styles.createButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Yeni Randevu
          </button>
        </div>
      </div>

      {/* CALENDAR WRAPPER */}
      <div className={styles.calendarWrapper}>
        <CalendarTimeline />
      </div>
    </div>
  );
}