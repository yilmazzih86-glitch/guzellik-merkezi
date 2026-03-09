// src/app/admin/appointments/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/server/db/supabaseClient';
import CalendarTimeline from '@/components/admin/Calendar/CalendarTimeline';
import AppointmentList from '@/components/admin/AppointmentList/AppointmentList';
import styles from './Appointments.module.css';
import { AppointmentWithDetails } from '@/types/custom';

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KRİTİK DÜZELTME: useMemo kullanarak istemciyi sabitledik.
  const supabase = useMemo(() => createClient(), []);

  // Liste verilerini çek
  const fetchListAppointments = useCallback(async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (full_name, phone),
        services (name, duration_min),
        staff (name)
      `)
      .order('start_at', { ascending: false }) // En yeni en üstte
      .limit(50); // Performans limiti

    if (error) {
      console.error('Randevu listesi hatası:', error);
    } else {
      setAppointments(data as any || []);
    }
    
    setLoading(false);
    setIsRefreshing(false);
  }, [supabase]);

  // Görünüm değiştiğinde veri çek
  useEffect(() => {
    if (viewMode === 'list') {
      fetchListAppointments();
    }
  }, [viewMode, fetchListAppointments]);

  // Manuel Yenileme
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (viewMode === 'list') {
      fetchListAppointments();
    } else {
      // Takvim bileşeni kendi içinde veri çektiği için sayfayı yeniliyoruz
      window.location.reload();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>Randevu Yönetimi</h1>
          <p className={styles.pageSubtitle}>
            {viewMode === 'calendar' ? 'Haftalık doluluk ve planlama' : 'Son randevular ve işlem durumu'}
          </p>
        </div>
        
        <div className={styles.actionGroup}>
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleButton} ${viewMode === 'calendar' ? styles.active : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Takvim
            </button>
            <button 
              className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Liste
            </button>
          </div>

          <button 
            onClick={handleRefresh} 
            className={`${styles.refreshButton} ${isRefreshing ? styles.spinning : ''}`}
            title="Yenile"
            disabled={isRefreshing}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              <path d="M21 12v9" />
            </svg>
          </button>

          <button className={styles.createButton}>
            + Yeni Randevu
          </button>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {viewMode === 'calendar' ? (
          <CalendarTimeline />
        ) : (
          <div className={styles.listContainer}>
            {loading ? (
               <div className={styles.loadingState}>Yükleniyor...</div>
            ) : (
               <AppointmentList appointments={appointments} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}