'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../server/db/supabaseClient';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import layoutStyles from '../../../styles/layout.module.css';

interface Appointment {
  id: string;
  start_at: string;
  end_at: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  customer: {
    full_name: string;
    phone: string;
  };
  service: {
    name: string;
    duration_min: number;
  };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming'>('upcoming');

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
        service:services(name, duration_min)
      `)
      .order('start_at', { ascending: true });

    if (filter === 'upcoming') {
      const now = new Date().toISOString();
      query = query.gte('start_at', now).in('status', ['confirmed']);
    }

    const { data, error } = await query;
    
    if (data) {
      setAppointments(data as unknown as Appointment[]);
    } else if (error) {
      console.error('Randevular çekilirken hata:', error);
    }
    
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`Randevu durumunu '${newStatus}' olarak değiştirmek istediğinize emin misiniz?`)) return;

    const { error } = await supabaseClient
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setAppointments(appointments.map(app => 
        app.id === id ? { ...app, status: newStatus as any } : app
      ));
    } else {
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  // Sadece Saati Döndüren Format
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // Sadece Tarihi Döndüren Format
  const formatDateOnly = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Renk ve Etiket Haritalamaları
  const statusConfig: Record<string, { label: string, color: string, bg: string }> = {
    confirmed: { label: 'Onaylı', color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)' },
    completed: { label: 'Tamamlandı', color: 'var(--color-success)', bg: 'rgba(46, 204, 113, 0.1)' },
    cancelled: { label: 'İptal', color: 'var(--color-error)', bg: 'rgba(231, 76, 60, 0.1)' },
    no_show: { label: 'Gelmedi', color: '#f39c12', bg: 'rgba(243, 156, 18, 0.1)' }
  };

  return (
    <div className={`animate-fade-up ${layoutStyles.stackLg}`}>
      
      {/* BAŞLIK VE FİLTRELER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-16)' }}>
        <div>
          <h1 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--color-text-main)', fontWeight: '300' }}>Randevu Ajandası</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Tüm müşteri randevularını buradan yönetin.</p>
        </div>
        
        {/* Lüks Toggle Butonları */}
        <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
          <button 
            onClick={() => setFilter('upcoming')}
            style={{
              padding: '8px 24px',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              backgroundColor: filter === 'upcoming' ? 'var(--color-primary)' : 'transparent',
              color: filter === 'upcoming' ? '#fff' : 'var(--color-text-muted)',
              fontWeight: filter === 'upcoming' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all var(--transition-smooth)'
            }}
          >
            Yaklaşanlar
          </button>
          <button 
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 24px',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              backgroundColor: filter === 'all' ? 'var(--color-primary)' : 'transparent',
              color: filter === 'all' ? '#fff' : 'var(--color-text-muted)',
              fontWeight: filter === 'all' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all var(--transition-smooth)'
            }}
          >
            Tüm Geçmiş
          </button>
        </div>
      </div>

      {/* İÇERİK (LİSTE) */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', color: 'var(--color-primary)', padding: 'var(--space-24)' }}>
          <svg className="spinner" style={{ animation: 'spin 1s linear infinite', width: '1.5em', height: '1.5em' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: '500' }}>Ajanda Senkronize Ediliyor...</span>
        </div>
      ) : appointments.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-64) 0', borderStyle: 'dashed' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-16) auto', color: 'var(--color-text-muted)' }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h3 style={{ margin: '0 0 var(--space-8) 0', color: 'var(--color-text-main)' }}>Randevu Bulunmuyor</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Bu filtreye uygun herhangi bir kayıt bulunamadı.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {appointments.map((app, index) => {
            const status = statusConfig[app.status];
            
            return (
              <Card 
                key={app.id} 
                className="animate-fade-up"
                style={{ 
                  animationDelay: `${index * 0.05}s`, // Kartların sırayla şelale gibi düşmesi için
                  padding: 0, // İçeriği grid ile böleceğimiz için padding'i sıfırlıyoruz
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto', // 3 Kolon: Saat, Bilgi, Butonlar
                  alignItems: 'center',
                  overflow: 'hidden'
                }}
              >
                
                {/* 1. KOLON: SAAT VE TARİH */}
                <div style={{ 
                  backgroundColor: 'var(--color-background)', 
                  height: '100%', 
                  padding: 'var(--space-24)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRight: '1px solid var(--color-border)'
                }}>
                  <strong style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-main)' }}>{formatTime(app.start_at)}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '4px', textTransform: 'uppercase' }}>
                    {formatDateOnly(app.start_at)}
                  </span>
                </div>

                {/* 2. KOLON: MÜŞTERİ VE HİZMET */}
                <div style={{ padding: 'var(--space-24)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-main)' }}>
                      {app.customer?.full_name || 'İsimsiz Müşteri'}
                    </h3>
                    {/* Statüs Rozeti */}
                    <div style={{ 
                      backgroundColor: status.bg, 
                      color: status.color, 
                      padding: '4px 12px', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.color }}></span>
                      {status.label}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-24)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      {app.service?.name || 'Bilinmeyen Hizmet'} ({app.service?.duration_min} dk)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {app.customer?.phone || 'Telefon Yok'}
                    </div>
                  </div>

                </div>

                {/* 3. KOLON: AKSİYON BUTONLARI */}
                <div style={{ padding: 'var(--space-24)' }}>
                  {app.status === 'confirmed' ? (
                    <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                      {/* Tamamlandı Butonu (Yeşil İkonlu) */}
                      <button 
                        onClick={() => handleStatusChange(app.id, 'completed')}
                        title="Randevu Tamamlandı"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(46, 204, 113, 0.3)', backgroundColor: 'rgba(46, 204, 113, 0.05)', color: 'var(--color-success)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </button>

                      {/* Gelmedi Butonu (Turuncu İkonlu) */}
                      <button 
                        onClick={() => handleStatusChange(app.id, 'no_show')}
                        title="Müşteri Gelmedi"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(243, 156, 18, 0.3)', backgroundColor: 'rgba(243, 156, 18, 0.05)', color: '#f39c12', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </button>

                      {/* İptal Butonu (Kırmızı İkonlu) */}
                      <button 
                        onClick={() => handleStatusChange(app.id, 'cancelled')}
                        title="Randevuyu İptal Et"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(231, 76, 60, 0.3)', backgroundColor: 'rgba(231, 76, 60, 0.05)', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ) : (
                    // İşlem yapılmışsa sadece tarihi / durumu kilitleyen ikon göster
                    <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      İşlem Kapalı
                    </div>
                  )}
                </div>

              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}