'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../server/db/supabaseClient';
import { Card } from '../../../components/ui/Card/Card';
import layoutStyles from '../../../styles/layout.module.css';
import AppointmentList from '../../../components/admin/AppointmentList/AppointmentList';
import CalendarTimeline from '../../../components/admin/Calendar/CalendarTimeline';

interface Appointment {
  id: string;
  start_at: string;
  end_at: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending';
  customer: {
    full_name: string;
    phone: string;
  };
  service: {
    name: string;
    duration_min: number;
  };
  staff: {
    name: string;
  } | null;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming'>('upcoming');
  const [viewType, setViewType] = useState<'list' | 'calendar'>('calendar');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    let query = supabaseClient
      .from('appointments')
      .select(`
        id, start_at, end_at, status,
        customer:customers(full_name, phone),
        service:services(name, duration_min),
        staff:staff(name)
      `)
      .order('start_at', { ascending: true });

    if (filter === 'upcoming') {
      const now = new Date().toISOString();
      query = query.gte('start_at', now).in('status', ['confirmed', 'pending']);
    }

    const { data, error } = await query;
    if (data) setAppointments(data as any);
    setLoading(false);
  };

  return (
    <div className={`animate-fade-up ${layoutStyles.stackLg}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-24)', flexWrap: 'wrap', gap: 'var(--space-16)' }}>
        <div>
          <h1 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--color-text-main)', fontWeight: '300', fontSize: '1.75rem' }}>Randevu Ajandası</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Luxe Beauty Center operasyon yönetimi.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
            <button onClick={() => setViewType('calendar')} style={{ padding: '8px 16px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: viewType === 'calendar' ? 'var(--color-primary)' : 'transparent', color: viewType === 'calendar' ? '#fff' : 'var(--color-text-muted)', cursor: 'pointer' }}>📅 Takvim</button>
            <button onClick={() => setViewType('list')} style={{ padding: '8px 16px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: viewType === 'list' ? 'var(--color-primary)' : 'transparent', color: viewType === 'list' ? '#fff' : 'var(--color-text-muted)', cursor: 'pointer' }}>📜 Liste</button>
          </div>
        </div>
      </div>

      {loading ? <p>Yükleniyor...</p> : (
        viewType === 'list' ? <AppointmentList appointments={appointments as any} /> : <CalendarTimeline appointments={appointments as any} />
      )}
    </div>
  );
}