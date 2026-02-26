'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../server/db/supabaseClient';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import layoutStyles from '../../../styles/layout.module.css';

// TypeScript Tipleri (İlişkisel tablolarla birlikte)
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
  const [filter, setFilter] = useState<'all' | 'upcoming'>('upcoming'); // Basit filtreleme

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    
    // Supabase'de JOIN işlemi: customer ve service tablolarından veri çekiyoruz
    let query = supabaseClient
      .from('appointments')
      .select(`
        id, start_at, end_at, status,
        customer:customers(full_name, phone),
        service:services(name, duration_min)
      `)
      .order('start_at', { ascending: true });

    // Sadece gelecek randevuları göster filtresi
    if (filter === 'upcoming') {
      const now = new Date().toISOString();
      query = query.gte('start_at', now).in('status', ['confirmed']);
    }

    const { data, error } = await query;
    
    if (data) {
      // Supabase ilişkisel verileri dizi olarak dönebilir (1-N ilişkilerinde), 
      // biz tekil (1-1) olduğunu bildiğimiz için tip dönüşümü yapıyoruz.
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
      // Arayüzü güncelle
      setAppointments(appointments.map(app => 
        app.id === id ? { ...app, status: newStatus as any } : app
      ));
    } else {
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  // Tarihleri güzel formatlamak için yardımcı fonksiyon
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('tr-TR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Duruma göre renk döndüren fonksiyon
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return '#3498db'; // Mavi
      case 'completed': return 'var(--color-success)'; // Yeşil
      case 'cancelled': return 'var(--color-error)'; // Kırmızı
      case 'no_show': return '#f39c12'; // Turuncu
      default: return 'var(--color-text-muted)';
    }
  };

  // Durumların Türkçe karşılıkları
  const statusLabels: Record<string, string> = {
    confirmed: 'Onaylandı',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    no_show: 'Gelmedi'
  };

  return (
    <div className={layoutStyles.stackLg}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-16)' }}>
        <h1>Randevular</h1>
        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
          <Button 
            variant={filter === 'upcoming' ? 'primary' : 'secondary'} 
            onClick={() => setFilter('upcoming')}
          >
            Yaklaşanlar
          </Button>
          <Button 
            variant={filter === 'all' ? 'primary' : 'secondary'} 
            onClick={() => setFilter('all')}
          >
            Tümü
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Randevular yükleniyor...</p>
      ) : appointments.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-24)' }}>
            Bu filtreye uygun randevu bulunamadı.
          </p>
        </Card>
      ) : (
        <div className={layoutStyles.stack}>
          {appointments.map(app => (
            <Card key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-16)' }}>
              
              {/* Sol Taraf: Randevu Bilgileri */}
              <div className={layoutStyles.stack} style={{ gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                  <h3 style={{ margin: 0 }}>{app.customer.full_name}</h3>
                  <span style={{ 
                    backgroundColor: getStatusColor(app.status), 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'bold'
                  }}>
                    {statusLabels[app.status]}
                  </span>
                </div>
                
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span><strong>Hizmet:</strong> {app.service.name} ({app.service.duration_min} dk)</span>
                  <span><strong>Tarih:</strong> {formatDate(app.start_at)}</span>
                  <span><strong>Telefon:</strong> {app.customer.phone || 'Belirtilmedi'}</span>
                </div>
              </div>

              {/* Sağ Taraf: Aksiyon Butonları (Sadece Confirmed ise göster) */}
              {app.status === 'confirmed' && (
                <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                  <Button size="md" variant="secondary" onClick={() => handleStatusChange(app.id, 'completed')} style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
                    Tamamlandı
                  </Button>
                  <Button size="md" variant="secondary" onClick={() => handleStatusChange(app.id, 'no_show')} style={{ color: '#f39c12', borderColor: '#f39c12' }}>
                    Gelmedi
                  </Button>
                  <Button size="md" variant="secondary" onClick={() => handleStatusChange(app.id, 'cancelled')} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                    İptal Et
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}