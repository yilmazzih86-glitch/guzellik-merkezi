'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../server/db/supabaseClient';
import { Card } from '../../components/ui/Card/Card';
import layoutStyles from '../../styles/layout.module.css';

export default function AdminDashboard() {
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);

    const now = new Date();
    // Bugünün başlangıcı ve bitişi (Yerel saate göre)
    const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfToday = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    const currentTime = new Date().toISOString();

    // 1. Bugünkü Randevular (Sadece onaylanmış olanlar)
    const { count: todayAppointments } = await supabaseClient
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('start_at', startOfToday)
      .lte('start_at', endOfToday)
      .eq('status', 'confirmed');

    // 2. Bekleyen/Yaklaşan Tüm Randevular (Şu andan sonrakiler)
    const { count: upcomingAppointments } = await supabaseClient
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('start_at', currentTime)
      .eq('status', 'confirmed');

    // 3. Toplam Müşteri Sayısı
    const { count: totalCustomers } = await supabaseClient
      .from('customers')
      .select('*', { count: 'exact', head: true });

    setTodayCount(todayAppointments || 0);
    setUpcomingCount(upcomingAppointments || 0);
    setCustomerCount(totalCustomers || 0);
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-24)' }}>Dashboard</h1>
      
      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Metrikler yükleniyor...</p>
      ) : (
        <div className={layoutStyles.grid}>
          <Card>
            <h3 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>Bugünkü Randevular</h3>
            <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--color-primary)' }}>{todayCount}</p>
          </Card>
          
          <Card>
            <h3 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>Yaklaşan Randevular</h3>
            <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold' }}>{upcomingCount}</p>
          </Card>
          
          <Card>
            <h3 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>Toplam Müşteri</h3>
            <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold' }}>{customerCount}</p>
          </Card>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-48)' }}>
        <h2>Sisteme Hoş Geldiniz</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-8)' }}>
          Sol menüyü kullanarak randevularınızı yönetebilir, müşteri detaylarına ulaşabilir veya işletme ayarlarınızı (çalışma saatleri, hizmetler vs.) güncelleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}