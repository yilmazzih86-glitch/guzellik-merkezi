// src/app/admin/appointments/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/server/db/supabaseClient';
import { startOfDay, endOfDay } from 'date-fns';
import CalendarTimeline from '@/components/admin/Calendar/CalendarTimeline';
import CalendarMonthly from '@/components/admin/Calendar/CalendarMonthly';
import AppointmentList from '@/components/admin/AppointmentList/AppointmentList';
import CreateAppointmentModal from '@/components/admin/AppointmentModal/CreateAppointmentModal'; // YENİ EKLENDİ
import styles from './Appointments.module.css';
import { AppointmentWithDetails } from '@/types/custom';

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // YENİ EKLENDİ: Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchDailyAppointments = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    
    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (full_name, phone),
        services (name, duration_min),
        staff (name)
      `)
      .gte('start_at', todayStart)
      .lte('start_at', todayEnd)
      .order('start_at', { ascending: true }); 

    if (error) {
      console.error('Günlük randevu hatası:', error);
    } else if (isMounted) {
      setAppointments(data as any || []);
    }
    
    if (isMounted) {
      setLoading(false);
      setIsRefreshing(false);
    }
    
    return () => { isMounted = false; };
  }, [supabase, refreshTrigger]);

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchDailyAppointments();
    }
  }, [viewMode, fetchDailyAppointments]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>Randevu Yönetimi</h1>
          <p className={styles.pageSubtitle}>
            {viewMode === 'daily' && 'Bugünün randevuları ve işlem durumu'}
            {viewMode === 'weekly' && 'Haftalık doluluk ve planlama'}
            {viewMode === 'monthly' && 'Aylık genel bakış ve doluluk'}
          </p>
        </div>
        
        <div className={styles.actionGroup}>
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleButton} ${viewMode === 'daily' ? styles.active : ''}`}
              onClick={() => setViewMode('daily')}
            >
              📝 Günlük Liste
            </button>
            <button 
              className={`${styles.toggleButton} ${viewMode === 'weekly' ? styles.active : ''}`}
              onClick={() => setViewMode('weekly')}
            >
              📅 Haftalık
            </button>
            <button 
              className={`${styles.toggleButton} ${viewMode === 'monthly' ? styles.active : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              🗓️ Aylık
            </button>
          </div>

          <button 
            onClick={handleRefresh} 
            className={`${styles.refreshButton} ${isRefreshing ? styles.spinning : ''}`}
            title="Yenile"
            disabled={isRefreshing}
          >
            Yenile
          </button>

          {/* YENİ EKLENDİ: onClick ile Modal açılıyor */}
          <button className={styles.createButton} onClick={() => setIsModalOpen(true)}>
            + Yeni Randevu
          </button>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {viewMode === 'daily' && (
          <div className={styles.listContainer}>
            {loading ? (
               <div className={styles.loadingState}>Yükleniyor...</div>
            ) : (
               <AppointmentList 
                 appointments={appointments} 
                 onUpdate={handleUpdate} 
               />
            )}
          </div>
        )}
        
        {viewMode === 'weekly' && (
          <CalendarTimeline refreshTrigger={refreshTrigger} onUpdate={handleUpdate} />
        )}

        {viewMode === 'monthly' && (
          <CalendarMonthly refreshTrigger={refreshTrigger} onUpdate={handleUpdate} />
        )}
      </div>

      {/* YENİ EKLENDİ: Yeni Randevu Modalı */}
      <CreateAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false); // Başarılı olunca popup'ı kapat
          handleUpdate();        // Listeyi ve Takvimi yenile
        }}
      />

    </div>
  );
}