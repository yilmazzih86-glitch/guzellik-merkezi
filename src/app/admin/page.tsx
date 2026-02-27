'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '../../server/db/supabaseClient';
import { Card } from '../../components/ui/Card/Card';
import layoutStyles from '../../styles/layout.module.css';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

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

    try {
      // 1. Bugünkü Randevular (SADECE ONAYLANMIŞ OLANLAR)
      const { count: todayAppointments } = await supabaseClient
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_at', startOfToday)
        .lte('start_at', endOfToday)
        .eq('status', 'confirmed'); // <-- EKSİK OLAN KISIM EKLENDİ

      // 2. Bekleyen/Yaklaşan Tüm Randevular (SADECE ONAYLANMIŞ OLANLAR)
      const { count: upcomingAppointments } = await supabaseClient
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_at', currentTime)
        .eq('status', 'confirmed'); // <-- EKSİK OLAN KISIM EKLENDİ

      // 3. Toplam Müşteri Sayısı
      const { count: totalCustomers } = await supabaseClient
        .from('customers')
        .select('*', { count: 'exact', head: true });

      setTodayCount(todayAppointments || 0);
      setUpcomingCount(upcomingAppointments || 0);
      setCustomerCount(totalCustomers || 0);
    } catch (error) {
      console.error('Metrikler çekilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      {/* Karşılama Başlığı */}
      <div style={{ marginBottom: 'var(--space-32)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: '300', margin: '0 0 var(--space-8) 0', color: 'var(--color-text-main)' }}>
          Merhaba, <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Luxe Clinic</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', margin: 0 }}>
          İşletmenizin bugünkü özetine göz atın.
        </p>
      </div>
      
      {loading ? (
        <div className={layoutStyles.stackLg}>
          {/* Gerçek kartların düzenini taklit eden Skeleton Grid */}
          <div className={layoutStyles.grid}>
             {/* 3 Adet Metrik Kartı Yerine Geçecek Kutular */}
             <Skeleton height="180px" width="100%" borderRadius="12px" />
             <Skeleton height="180px" width="100%" borderRadius="12px" />
             <Skeleton height="180px" width="100%" borderRadius="12px" />
          </div>
          
          {/* Hızlı İşlemler Başlığı için Skeleton */}
          <div style={{ marginTop: 'var(--space-32)' }}>
            <Skeleton height="30px" width="200px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-16)' }}>
               <Skeleton height="80px" borderRadius="12px" />
               <Skeleton height="80px" borderRadius="12px" />
            </div>
          </div>
        </div>
      ) : (
        <div className={layoutStyles.stackLg}>
          {/* İSTATİSTİK KARTLARI (GRID) */}
          <div className={layoutStyles.grid}>
            
            {/* Kart 1: Bugünkü Randevular */}
            <Card style={{ position: 'relative', overflow: 'hidden', padding: 'var(--space-24)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 var(--space-8) 0' }}>Bugünkü Randevular</h3>
                  <div style={{ fontSize: '3rem', fontWeight: '300', color: 'var(--color-text-main)', lineHeight: '1' }}>{todayCount}</div>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-16)', fontSize: 'var(--text-sm)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                <span>Harekete geçmeye hazır</span>
              </div>
            </Card>
            
            {/* Kart 2: Yaklaşan Randevular */}
            <Card style={{ position: 'relative', overflow: 'hidden', padding: 'var(--space-24)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 var(--space-8) 0' }}>Yaklaşan Randevular</h3>
                  <div style={{ fontSize: '3rem', fontWeight: '300', color: 'var(--color-text-main)', lineHeight: '1' }}>{upcomingCount}</div>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(46, 204, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-16)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                <span>Takviminiz planlandı</span>
              </div>
            </Card>
            
            {/* Kart 3: Toplam Danışan */}
            <Card style={{ position: 'relative', overflow: 'hidden', padding: 'var(--space-24)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 var(--space-8) 0' }}>Toplam Danışan</h3>
                  <div style={{ fontSize: '3rem', fontWeight: '300', color: 'var(--color-text-main)', lineHeight: '1' }}>{customerCount}</div>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3498db' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-16)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                <span>Kayıtlı müşteri portföyü</span>
              </div>
            </Card>
          </div>

          {/* HIZLI İŞLEMLER BÖLÜMÜ */}
          <div style={{ marginTop: 'var(--space-32)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '500', marginBottom: 'var(--space-16)', color: 'var(--color-text-main)' }}>Hızlı İşlemler</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-16)' }}>
              
              <Link href="/admin/appointments" style={{ textDecoration: 'none' }}>
                <Card interactive style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', padding: 'var(--space-16)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--color-text-main)', fontSize: 'var(--text-base)' }}>Randevuları Yönet</strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Takvimi görüntüle ve düzenle</span>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
                <Card interactive style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', padding: 'var(--space-16)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--color-text-main)', fontSize: 'var(--text-base)' }}>Yeni Hizmet Ekle</strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Vitrine yeni uygulama ekle</span>
                  </div>
                </Card>
              </Link>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}